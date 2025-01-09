from django.core.management.base import BaseCommand
from users.models import EmailAccount

class Command(BaseCommand):
    help = 'Retrieve first_name and last_name corresponding to a list of emails from a file'

    def add_arguments(self, parser):
        # Add an argument to pass a file containing emails
        parser.add_argument('email_file', type=str, help='Path to the file containing emails')

    def handle(self, *args, **kwargs):
        email_file = kwargs['email_file']
        
        try:
            with open(email_file, 'r') as file:
                emails = [line.strip() for line in file if line.strip()]
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f"File {email_file} not found."))
            return
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error reading file {email_file}: {e}"))
            return
        
        if not emails:
            self.stdout.write(self.style.WARNING('No emails found in the file.'))
            return

        # Loop through emails in the order they appear in the file
        for email in emails:
            # Fetch the corresponding EmailAccount entry
            try:
                email_account = EmailAccount.objects.get(email=email)
                user = email_account.user
                if user:
                    # Output first and last name if user exists
                    self.stdout.write(f"{user.first_name} {user.last_name}")
                else:
                    # Handle the case where user is null (SET_NULL)
                    self.stdout.write(f"No user associated")
            except EmailAccount.DoesNotExist:
                self.stdout.write(self.style.WARNING(f"No EmailAccount found"))