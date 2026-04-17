from django.contrib import admin
from .models import PreferenceEntry


@admin.register(PreferenceEntry)
class PreferenceEntryAdmin(admin.ModelAdmin):
    list_display = ('id', 'profile', 'category', 'title', 'sentiment', 'level', 'created_by', 'created_at')
    list_filter = ('sentiment', 'category', 'created_at')
    search_fields = ('profile__full_name', 'profile__username', 'title', 'note')
    ordering = ('-created_at',)
    raw_id_fields = ('profile', 'created_by')
