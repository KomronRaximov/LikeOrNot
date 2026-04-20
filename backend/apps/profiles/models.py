from django.db import models
from django.conf import settings


class Profile(models.Model):
    RELATION_CHOICES = [
        ('self', 'Self'),
        ('friend', 'Friend'),
        ('brother', 'Brother'),
        ('sister', 'Sister'),
        ('mother', 'Mother'),
        ('father', 'Father'),
        ('colleague', 'Colleague'),
        ('partner', 'Partner'),
        ('girlfriend', 'Girlfriend'),
        ('boyfriend', 'Boyfriend'),
        ('custom', 'Custom'),
    ]

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='owned_profiles'
    )
    linked_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='linked_profiles'
    )
    username = models.CharField(max_length=150)
    full_name = models.CharField(max_length=255)
    nickname = models.CharField(max_length=100, blank=True)
    relation = models.CharField(max_length=20, choices=RELATION_CHOICES, default='custom')
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    is_self_profile = models.BooleanField(default=False)
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Profile'
        verbose_name_plural = 'Profiles'
        unique_together = ('owner', 'username')
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.full_name} (@{self.username}) — {self.owner.username}'

    @property
    def preference_count(self):
        return self.preferences.count()

    @property
    def like_count(self):
        return self.preferences.filter(sentiment='like').count()

    @property
    def dislike_count(self):
        return self.preferences.filter(sentiment='dislike').count()


class Note(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notes'
    )
    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='notes',
        null=True,
        blank=True,
    )
    title = models.CharField(max_length=255)
    body = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Note'
        verbose_name_plural = 'Notes'
        ordering = ['-updated_at']

    def __str__(self):
        return f'{self.title} — {self.owner.username}'
