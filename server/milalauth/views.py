from django.utils import timezone
from django.shortcuts import render
from django.core.cache import cache
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets

import uuid

from utils.gsheets import SATURDAY_CHECKIN_SPREADSHEET_ID, get_gsheets_service

# Create your views here.


class AuthViewSet(viewsets.ViewSet):
    SIGN_IN_CACHE_KEY = "SIGN_IN_CACHE_KEY"
    SIGN_IN_KEY_TTL = 60 * 60 * 24  # seconds

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
        if request.method == "POST":
            curr_time = timezone.localtime(timezone.now()).strftime(
                "%Y-%m-%d %H:%M:%S%z"
            )
            values = [
                [request.data["name"], request.data["email"], curr_time],
            ]
            body = {"values": values}

            # Call the Sheets API
            service = get_gsheets_service()
            sheet = service.spreadsheets()
            sheet.values().append(
                spreadsheetId=SATURDAY_CHECKIN_SPREADSHEET_ID,
                range="Sheet1!A:C",
                valueInputOption="USER_ENTERED",
                body=body,
            ).execute()

            return Response(status=200)

        return Response(status=405)
