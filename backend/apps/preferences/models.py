from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings


def default_preference_image():
    return settings.DEFAULT_PREFERENCE_IMAGE


class PreferenceEntry(models.Model):
    SENTIMENT_CHOICES = [
        ('like', 'Like'),
        ('neutral', 'Neutral'),
        ('dislike', 'Dislike'),
    ]

    profile = models.ForeignKey(
        'profiles.Profile',
        on_delete=models.CASCADE,
        related_name='preferences'
    )
    category = models.ForeignKey(
        'categories.Category',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='preferences'
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    sentiment = models.CharField(max_length=10, choices=SENTIMENT_CHOICES, default='like')
    level = models.IntegerField(
        default=3,
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    image = models.ImageField(upload_to='preferences/', null=True, blank=True)
    image_source_type = models.CharField(
        max_length=10,
        choices=[('uploaded', 'Uploaded'), ('default', 'Default')],
        default='default'
    )
    note = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_preferences'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Preference Entry'
        verbose_name_plural = 'Preference Entries'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.profile.full_name} — {self.title} ({self.sentiment})'

    def save(self, *args, **kwargs):
        if not self.image:
            self.image_source_type = 'default'
        else:
            self.image_source_type = 'uploaded'
        super().save(*args, **kwargs)

    @property
    def image_url(self):
        if self.image:
            return self.image.url
        return f'/media/{settings.DEFAULT_PREFERENCE_IMAGE}'
