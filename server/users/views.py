from httplib2 import Response
from rest_framework import viewsets
from rest_framework.throttling import AnonRateThrottle
from authz.permissions import HasAdminPermission
from users.serializers import EmailAccountSerializer
from users.models import Volunteer, MilalFriend, EmailAccount
from users.serializers import VolunteerSerializer, MilalFriendSerializer


class VolunteerViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows volunteers to be viewed or edited.
    """

    permission_classes = [HasAdminPermission]

    queryset = Volunteer.objects.all().order_by("first_name")
    serializer_class = VolunteerSerializer
    filterset_fields = {
        "first_name": ["icontains"],
        "last_name": ["icontains"],
    }


class MilalFriendViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows milal friends to be viewed or edited.
    """

    permission_classes = [HasAdminPermission]

    queryset = MilalFriend.objects.all().order_by("first_name")
    serializer_class = MilalFriendSerializer
    filterset_fields = {
        "first_name": ["icontains"],
        "last_name": ["icontains"],
    }


class EmailAccountViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows email accounts to be viewed or edited.
    """

    permission_classes = [HasAdminPermission]

    queryset = EmailAccount.objects.all().order_by("-created_at")
    serializer_class = EmailAccountSerializer
    filterset_fields = {
        "user": ["exact", "isnull"],
        "email": ["exact"],
        "display_name": ["icontains"],
    }


# from rest_framework.views import APIView

# class SimpleThrottledView(APIView):
#     throttle_classes = [AnonRateThrottle]

#     def get(self, request):
#         return Response({'message': 'Request is throttled if you exceed the limit'})