from django.conf import settings
from google.oauth2 import service_account
from googleapiclient.discovery import build

SATURDAY_CHECKIN_SPREADSHEET_ID = settings.GSHEET_CONFIG[
    "SATURDAY_CHECKIN_SPREADSHEET_ID"
]
SATURDAY_CHECKIN_SPREADSHEET_RANGE = settings.GSHEET_CONFIG[
    "SATURDAY_CHECKIN_SPREADSHEET_RANGE"
]


def get_service_creds():
    return service_account.Credentials.from_service_account_file(
        "./utils/credentials.json"
    )


def get_gsheets_service():
    return build("sheets", "v4", credentials=get_service_creds())
