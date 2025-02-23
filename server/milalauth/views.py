import re
import redis
from django.conf import settings
from django.utils import timezone
from django.shortcuts import render
from django.core.cache import cache
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.views import APIView

import uuid
from utils.throttling import NoThrottle
from utils.decorators import SERIALIZER_CACHE_KEY
from utils.gsheets import SATURDAY_CHECKIN_SPREADSHEET_ID, get_gsheets_service

# Create your views here.

# Connect to Redis directly using StrictRedis
strict_cache = redis.StrictRedis(host=settings.REDIS_HOST, port=settings.REDIS_PORT, db=settings.REDIS_DB)

class AuthViewSet(viewsets.ViewSet):
    SIGN_IN_CACHE_KEY = "SIGN_IN_CACHE_KEY"
    SIGN_IN_KEY_TTL = 60 * 60 * 24  # seconds

    # Get or Create sign-in token
    @action(
        detail=False,
        methods=["get", "post"],
        url_path="sign_in_token",
        url_name="sign_in_token",
        permission_classes=[IsAuthenticated],
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

    # On QR code access, checking validity of sign-in token for access to sign-in form
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

    # Create a sign-in record on sign-in form submit
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

class CacheViewSet(viewsets.ViewSet):
    SERIALIZER_CACHE_KEY_REGEX = f".*{SERIALIZER_CACHE_KEY}.*"
    
    @action(
        detail=False,
        methods=["post"],
        url_path="clear_serializer",
        url_name="clear_serializer",
        permission_classes=[IsAuthenticated],
    )
    def clear_serializer(self, request):
        try:

            # Compile the regular expression pattern
            regex = re.compile(self.SERIALIZER_CACHE_KEY_REGEX)

            # Scan through all keys in Redis
            cursor = 0
            deleted_count = 0

            while True:
                cursor, keys = strict_cache.scan(cursor, match='*', count=1000)
                
                for key in keys:
                    print(key.decode('utf-8'))
                    if regex.match(key.decode('utf-8')):  # Decode key from bytes to string
                        strict_cache.delete(key)
                        deleted_count += 1
                
                # If cursor is 0, the scan is complete
                if cursor == 0:
                    break

            return Response({"detail": f"{deleted_count} keys deleted"}, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({"detail": f"Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PingView(APIView):

    # Do not throttle on ping requests
    throttle_classes = [NoThrottle] 
    def get(self, request):
        # Simple health check response
        return Response({"status": "ok"}, status=status.HTTP_200_OK)
