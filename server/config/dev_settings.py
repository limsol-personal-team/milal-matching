import os

LOCAL_BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

GSHEET_CONFIG = {
    "SATURDAY_CHECKIN_SPREADSHEET_ID": "1Rjcd9oaugMVqE7nVRmOQRsz8GX_hm2MCl_swpi3pdno",
    "SATURDAY_CHECKIN_SPREADSHEET_RANGE": "Sheet1!A:C",
}

# Database
# https://docs.djangoproject.com/en/1.11/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": os.path.join(LOCAL_BASE_DIR, "db.sqlite3"),
    }
}
