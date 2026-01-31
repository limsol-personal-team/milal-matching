from google.oauth2 import service_account
from googleapiclient.discovery import build


def get_service_creds():
    return service_account.Credentials.from_service_account_file(
        "./utils/credentials.json"
    )


def get_gsheets_service():
    return build("sheets", "v4", credentials=get_service_creds())
