from django.contrib import admin
from .models import Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'slug', 'icon', 'created_at')
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}
