from datetime import date
from django.core.management.base import BaseCommand
from users.models import Volunteer

class Command(BaseCommand):
    help = 'Filters all volunteers with records created in the current month'

    def handle(self, *args, **kwargs):
        # Get the current month and year
        current_month = date.today().month
        current_year = date.today().year

        # Query users with related records in the current month
        users_with_recent_records = Volunteer.objects.filter(
            volunteerhours__created_at__year=current_year,
            volunteerhours__created_at__month=current_month
        ).distinct().order_by('first_name')

        # Output the results
        if users_with_recent_records.exists():
            self.stdout.write("Users with records created this month:")
            for user in users_with_recent_records:
                self.stdout.write(f"{user.first_name} {user.last_name}")  # Adjust to your user model's field
        else:
            self.stdout.write("No users with records created this month.")
