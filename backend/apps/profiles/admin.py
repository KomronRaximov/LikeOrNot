from django.contrib import admin
from .models import Profile, Note


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'full_name', 'username', 'owner', 'relation', 'is_self_profile', 'is_public', 'created_at')
    list_filter = ('relation', 'is_self_profile', 'is_public')
    search_fields = ('full_name', 'username', 'owner__username')
    ordering = ('-created_at',)
    raw_id_fields = ('owner', 'linked_user')


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'owner', 'created_at', 'updated_at')
    search_fields = ('title', 'body', 'owner__username')
    ordering = ('-updated_at',)
    raw_id_fields = ('owner',)
