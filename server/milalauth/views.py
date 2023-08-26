from django.shortcuts import render
from django.core.cache import cache
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets


from google.oauth2 import service_account
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

import uuid
import os

# Create your views here.


class AuthViewSet(viewsets.ViewSet):
    SIGN_IN_CACHE_KEY = "SIGN_IN_CACHE_KEY"
    SIGN_IN_KEY_TTL = 60 * 60 * 24  # seconds
    SPREADSHEET_ID = "1Z566UWaWeCIkUtND8hx7721963J2gUHzwFJN2_Nh-bk"
    SCOPES = ["https://www.googleapis.com/auth/spreadsheets "]

    @action(
        detail=False,
        methods=["get", "post"],
        url_path="sign_in_token",
        url_name="sign_in_token",
    )
    def sign_in_token(self, request):
        if request.method == "GET":
            token = cache.get(self.SIGN_IN_CACHE_KEY)
            return Response({"token": token}, status=200)

        if request.method == "POST":
            value = uuid.uuid4().hex
            cache.set(self.SIGN_IN_CACHE_KEY, value, self.SIGN_IN_KEY_TTL)
            return Response({"token": value}, status=201)

        return Response(status=405)

    @action(
        detail=False,
        methods=["get"],
        url_path="sign_in_check",
        url_name="sign_in_check",
    )
    def sign_in_check(self, request):
        if request.method == "GET":
            token = request.query_params.get("token", None)
            if token is not None:
                if token == cache.get(self.SIGN_IN_CACHE_KEY):
                    return Response(status=200)
            return Response(status=401)

        return Response(status=405)

    @action(
        detail=False,
        methods=["post"],
        url_path="sign_in_record",
        url_name="sign_in_record",
    )
    def sign_in_record(self, request):
        creds = service_account.Credentials.from_service_account_file(
            "./milalauth/credentials.json"
        )
        if request.method == "POST":
            service = build("sheets", "v4", credentials=creds)
            values = [
                [
                    request.data["name"],
                    request.data["email"],
                    request.data["timestamp"],
                ],
            ]
            body = {"values": values}

            # Call the Sheets API
            sheet = service.spreadsheets()
            sheet.values().append(
                spreadsheetId=self.SPREADSHEET_ID,
                range="Sheet1!A:C",
                valueInputOption="USER_ENTERED",
                body=body,
            ).execute()

            return Response(status=200)

        return Response(status=405)
