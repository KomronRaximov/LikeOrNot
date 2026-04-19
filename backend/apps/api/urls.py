from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Auth
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('auth/me/', views.MeView.as_view(), name='me'),
    path('auth/telegram-sync/', views.TelegramSyncView.as_view(), name='telegram-sync'),

    # Profiles
    path('profiles/', views.ProfileListCreateView.as_view(), name='profile-list'),
    path('profiles/search/', views.ProfileSearchView.as_view(), name='profile-search'),
    path('profiles/create-from-username/', views.ProfileCreateFromUsernameView.as_view(), name='profile-from-username'),
    path('profiles/<int:pk>/', views.ProfileDetailView.as_view(), name='profile-detail'),

    # Categories
    path('categories/', views.CategoryListCreateView.as_view(), name='category-list'),
    path('categories/<int:pk>/', views.CategoryDetailView.as_view(), name='category-detail'),

    # Preferences
    path('preferences/', views.PreferenceListCreateView.as_view(), name='preference-list'),
    path('preferences/<int:pk>/', views.PreferenceDetailView.as_view(), name='preference-detail'),

    # Notes
    path('notes/', views.NoteListCreateView.as_view(), name='note-list'),
    path('notes/<int:pk>/', views.NoteDetailView.as_view(), name='note-detail'),

    # Stats
    path('stats/overview/', views.StatsOverviewView.as_view(), name='stats-overview'),
    path('stats/profile/<int:pk>/', views.StatsProfileView.as_view(), name='stats-profile'),
]
