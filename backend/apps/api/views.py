from rest_framework import generics, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Count, Avg, Q

from apps.users.models import User
from apps.profiles.models import Profile
from apps.categories.models import Category
from apps.preferences.models import PreferenceEntry
from apps.common.permissions import IsOwner
from .serializers import (
    UserRegisterSerializer, UserSerializer,
    CategorySerializer,
    ProfileSerializer, ProfilePublicSerializer,
    PreferenceEntrySerializer, TelegramSyncSerializer,
)


# ─── Auth ────────────────────────────────────────────────────────────────────

class RegisterView(generics.CreateAPIView):
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if not user:
            return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class TelegramSyncView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = TelegramSyncSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        user.telegram_id = serializer.validated_data['telegram_id']
        user.telegram_username = serializer.validated_data.get('telegram_username', '')
        user.save()
        return Response(UserSerializer(user).data)


# ─── Profiles ────────────────────────────────────────────────────────────────

class ProfileListCreateView(generics.ListCreateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Profile.objects.filter(owner=self.request.user)


class ProfileDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Profile.objects.filter(owner=self.request.user)


class ProfileSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        username = request.query_params.get('username', '').strip()
        if not username:
            return Response({'detail': 'username parameter required.'}, status=400)

        profile = Profile.objects.filter(username__iexact=username).first()
        if not profile:
            linked_user = User.objects.filter(username__iexact=username).first()
            if not linked_user:
                return Response({'found': False, 'profile': None})
            profile = Profile.objects.filter(linked_user=linked_user).first()
            if not profile:
                return Response({'found': False, 'profile': None, 'linked_user': UserSerializer(linked_user).data})

        if profile.owner == request.user:
            return Response({'found': True, 'profile': ProfileSerializer(profile, context={'request': request}).data})

        if not profile.is_public:
            return Response({'found': False, 'profile': None})

        return Response({'found': True, 'profile': ProfilePublicSerializer(profile, context={'request': request}).data})


class ProfileCreateFromUsernameView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        username = request.data.get('username', '').strip()
        full_name = request.data.get('full_name', username)
        relation = request.data.get('relation', 'custom')

        if not username:
            return Response({'detail': 'username is required.'}, status=400)

        existing = Profile.objects.filter(owner=request.user, username__iexact=username).first()
        if existing:
            return Response(ProfileSerializer(existing, context={'request': request}).data, status=200)

        linked_user = User.objects.filter(username__iexact=username).first()
        profile = Profile.objects.create(
            owner=request.user,
            username=username,
            full_name=full_name,
            relation=relation,
            linked_user=linked_user,
        )
        return Response(ProfileSerializer(profile, context={'request': request}).data, status=201)


# ─── Categories ──────────────────────────────────────────────────────────────

class CategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    queryset = Category.objects.all()


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    queryset = Category.objects.all()


# ─── Preferences ─────────────────────────────────────────────────────────────

class PreferenceListCreateView(generics.ListCreateAPIView):
    serializer_class = PreferenceEntrySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'note', 'description']

    def get_queryset(self):
        qs = PreferenceEntry.objects.filter(profile__owner=self.request.user)
        profile_id = self.request.query_params.get('profile')
        sentiment = self.request.query_params.get('sentiment')
        category_id = self.request.query_params.get('category')

        if profile_id:
            qs = qs.filter(profile_id=profile_id)
        if sentiment:
            qs = qs.filter(sentiment=sentiment)
        if category_id:
            qs = qs.filter(category_id=category_id)
        return qs.select_related('profile', 'category', 'created_by')


class PreferenceDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PreferenceEntrySerializer
    permission_classes = [IsAuthenticated, IsOwner]

    def get_queryset(self):
        return PreferenceEntry.objects.filter(profile__owner=self.request.user)


# ─── Statistics ──────────────────────────────────────────────────────────────

class StatsOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profiles = Profile.objects.filter(owner=user)
        prefs = PreferenceEntry.objects.filter(profile__owner=user)
        return Response({
            'total_profiles': profiles.count(),
            'total_preferences': prefs.count(),
            'total_likes': prefs.filter(sentiment='like').count(),
            'total_dislikes': prefs.filter(sentiment='dislike').count(),
            'total_neutral': prefs.filter(sentiment='neutral').count(),
        })


class StatsProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            profile = Profile.objects.get(pk=pk, owner=request.user)
        except Profile.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=404)

        prefs = PreferenceEntry.objects.filter(profile=profile)
        by_category = (
            prefs.values('category__name', 'category__icon')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        return Response({
            'profile': ProfileSerializer(profile, context={'request': request}).data,
            'total': prefs.count(),
            'likes': prefs.filter(sentiment='like').count(),
            'dislikes': prefs.filter(sentiment='dislike').count(),
            'neutral': prefs.filter(sentiment='neutral').count(),
            'avg_level': prefs.aggregate(avg=Avg('level'))['avg'],
            'by_category': list(by_category),
            'top_liked': PreferenceEntrySerializer(
                prefs.filter(sentiment='like').order_by('-level')[:5],
                many=True, context={'request': request}
            ).data,
            'top_disliked': PreferenceEntrySerializer(
                prefs.filter(sentiment='dislike').order_by('-level')[:5],
                many=True, context={'request': request}
            ).data,
        })
