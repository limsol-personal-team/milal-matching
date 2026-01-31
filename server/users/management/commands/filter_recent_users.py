from datetime import date, datetime
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db.models import Max
from users.models import Volunteer

class Command(BaseCommand):
    help = 'Filters all volunteers with records (by service_date) since the specified month and year'

    def add_arguments(self, parser):
        parser.add_argument(
            '--month',
            type=int,
            help='Month (1-12) to filter from. Defaults to current month if not provided.',
        )
        parser.add_argument(
            '--year',
            type=int,
            help='Year to filter from. Defaults to current year if not provided.',
        )

    def handle(self, *args, **kwargs):
        month = kwargs.get('month')
        year = kwargs.get('year')

        if month is None or year is None:
            current_date = date.today()
            month = month or current_date.month
            year = year or current_date.year

        if not (1 <= month <= 12):
            self.stdout.write(self.style.ERROR(f'Invalid month: {month}. Must be between 1 and 12.'))
            return

        filter_date = datetime(year, month, 1)
        filter_date = timezone.make_aware(filter_date)

        users_with_recent_records = Volunteer.objects.filter(
            volunteerhours__service_date__gte=filter_date
        ).annotate(
            most_recent_record=Max('volunteerhours__service_date')
        ).distinct().order_by('first_name')

        if users_with_recent_records.exists():
            self.stdout.write(f"Users with records (service_date) since {month}/{year}:")
            for user in users_with_recent_records:
                emails = list(user.emailaccount_set.values_list('email', flat=True))
                emails_str = ', '.join(emails) if emails else 'No emails'
                most_recent = user.most_recent_record
                most_recent_str = most_recent.strftime('%Y-%m-%d') if most_recent else 'N/A'
                self.stdout.write(f"{user.first_name} {user.last_name} - {emails_str} - {most_recent_str}")
        else:
            self.stdout.write(f"No users with records (service_date) since {month}/{year}.")
