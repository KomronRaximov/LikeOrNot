from rest_framework import serializers
from django.conf import settings
from apps.users.models import User
from apps.profiles.models import Profile
from apps.categories.models import Category
from apps.preferences.models import PreferenceEntry


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ('id', 'username', 'full_name', 'email', 'password')

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'full_name', 'email', 'phone_number',
                  'telegram_id', 'telegram_username', 'created_at')
        read_only_fields = ('id', 'created_at')


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'icon', 'created_at')
        read_only_fields = ('id', 'slug', 'created_at')


class ProfileSerializer(serializers.ModelSerializer):
    preference_count = serializers.ReadOnlyField()
    like_count = serializers.ReadOnlyField()
    dislike_count = serializers.ReadOnlyField()
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = (
            'id', 'owner', 'linked_user', 'username', 'full_name', 'nickname',
            'relation', 'bio', 'avatar', 'avatar_url', 'is_self_profile', 'is_public',
            'preference_count', 'like_count', 'dislike_count',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'owner', 'created_at', 'updated_at')

    def get_avatar_url(self, obj):
        request = self.context.get('request')
        if obj.avatar and request:
            return request.build_absolute_uri(obj.avatar.url)
        return None

    def validate(self, data):
        request = self.context.get('request')
        user = request.user
        if data.get('is_self_profile'):
            qs = Profile.objects.filter(owner=user, is_self_profile=True)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError('You already have a self profile.')
        return data

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)


class ProfilePublicSerializer(serializers.ModelSerializer):
    """Limited serializer for public profile search results."""
    class Meta:
        model = Profile
        fields = ('id', 'username', 'full_name', 'relation', 'avatar', 'is_public')


class PreferenceEntrySerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_icon = serializers.CharField(source='category.icon', read_only=True)

    class Meta:
        model = PreferenceEntry
        fields = (
            'id', 'profile', 'category', 'category_name', 'category_icon',
            'title', 'description', 'sentiment', 'level',
            'image', 'image_url', 'image_source_type', 'note',
            'created_by', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_by', 'image_source_type', 'created_at', 'updated_at')

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        if request:
            return request.build_absolute_uri(f'/media/{settings.DEFAULT_PREFERENCE_IMAGE}')
        return f'/media/{settings.DEFAULT_PREFERENCE_IMAGE}'

    def validate_profile(self, value):
        request = self.context.get('request')
        if value.owner != request.user:
            raise serializers.ValidationError('You can only add preferences to your own profiles.')
        return value

    def validate_level(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError('Level must be between 1 and 5.')
        return value

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class TelegramSyncSerializer(serializers.Serializer):
    telegram_id = serializers.IntegerField()
    telegram_username = serializers.CharField(max_length=150, required=False, allow_blank=True)
