# Create your tasks here


from celery import shared_task
from celery.schedules import crontab
from server.celery import app
import pandas as pd

from django.utils import timezone
from django.db import transaction
from utils.gsheets import SATURDAY_CHECKIN_SPREADSHEET_RANGE
from utils.gsheets import SATURDAY_CHECKIN_SPREADSHEET_ID, get_gsheets_service
from users.models import EmailAccount
from records.models import VolunteerHours


@shared_task(bind=True, ignore_result=True)
@transaction.atomic
def process_saturday_checkin_data(self):

    service = get_gsheets_service()
    sheet = service.spreadsheets()
    result = (
        sheet.values()
        .get(
            spreadsheetId=SATURDAY_CHECKIN_SPREADSHEET_ID,
            range=SATURDAY_CHECKIN_SPREADSHEET_RANGE,
        )
        .execute()
    )

    if not result.get("values"):
        print(
            f"No data found for process_saturday_agape_data at: {timezone.localtime(timezone.now())}"
        )
        return

    columns = ["name", "email", "timestamp"]
    df = pd.DataFrame(result.get("values"), columns=columns)

    # Convert the timestamp to python datetime obj
    df["timestamp"] = pd.to_datetime(df["timestamp"], format="ISO8601")

    # Group by day
    df_list = [group[1] for group in df.groupby(df["timestamp"].dt.date)]

    for df_day in df_list:
        # Remove duplicates, taking first sign-in
        df_day = df_day.drop_duplicates(subset=["email"])

        for idx, row in df_day.iterrows():

            # Search or create corresponding email account
            account, created = EmailAccount.objects.get_or_create(email=row["email"])

            if created:
                account.display_name = row["name"]
                account.save(update_fields=["display_name"])

            # Create volunteering hours record
            VolunteerHours.objects.create(
                volunteer=account.user,  # Can be null if recently created account
                email=account,
                service_type=VolunteerHours.SATURDAY_AGAPE[0],
                service_date=row["timestamp"],
                hours=VolunteerHours.SATURDAY_AGAPE[1],
            )

    # Clear excel sheet if processed successfully
    clear_saturday_checkin_data.delay()


@shared_task(bind=True, ignore_result=True)
def clear_saturday_checkin_data(self):
    service = get_gsheets_service()
    sheet = service.spreadsheets()
    sheet.values().clear(
        spreadsheetId=SATURDAY_CHECKIN_SPREADSHEET_ID,
        range=SATURDAY_CHECKIN_SPREADSHEET_RANGE,
    ).execute()


## Cronjobs

app.conf.beat_schedule = {
    "process_saturday_checkin_data": {
        "task": "records.tasks.process_saturday_checkin_data",
        "schedule": crontab(hour=20, minute=0, day_of_week=6),
    },
}
