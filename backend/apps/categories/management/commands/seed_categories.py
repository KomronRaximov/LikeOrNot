from django.core.management.base import BaseCommand
from apps.categories.models import Category
from apps.categories.fixtures import DEFAULT_CATEGORIES


class Command(BaseCommand):
    help = 'Seed default categories'

    def handle(self, *args, **options):
        created = 0
        for item in DEFAULT_CATEGORIES:
            _, was_created = Category.objects.get_or_create(name=item['name'], defaults={'icon': item['icon']})
            if was_created:
                created += 1
        self.stdout.write(self.style.SUCCESS(f'Seeded {created} categories.'))
