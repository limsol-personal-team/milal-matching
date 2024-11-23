from django.utils import timezone
from rest_framework import viewsets
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from records.models import MilalMatching, VolunteerHours
from records.serializers import MilalMatchingSerializer, VolunteerHoursSerializer


class MilalMatchingViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing Milal Matching
    """

    permission_classes = [IsAuthenticated]

    queryset = MilalMatching.objects.all().order_by("-created_at")
    serializer_class = MilalMatchingSerializer
    filterset_fields = {
        "volunteer": ["exact"],
        "milal_friend": ["exact"],
        "created_at": ["gte", "lte", "exact", "gt", "lt"],
        "match_date": ["gte", "lte", "exact", "gt", "lt"],
    }

    @action(
        detail=False,
        methods=["post"],
        url_path="match",
        url_name="match",
    )
    def match(self, request, *args, **kwargs):
        
        data = request.data

        # Serialize the data
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        
        # Check if match already exists for the day
        milal_friend = serializer.validated_data.get('milal_friend')
        volunteer = serializer.validated_data.get('volunteer')
        local_date = timezone.localtime(timezone.now()).date()

        # For self-match requests, check if the user is already matched. If so, ignore.
        if volunteer == None:
            any_match = MilalMatching.objects.filter(match_date=local_date, milal_friend=milal_friend, volunteer__isnull=False)
            if any_match.exists():
                return Response(status=status.HTTP_202_ACCEPTED)

        # For regular match requests, check if match already exists. Do not create a new instance and return 200 response
        else:
            milal_match = MilalMatching.objects.filter(match_date=local_date, milal_friend=milal_friend, volunteer=volunteer)
            if milal_match.exists():
                return Response(status=status.HTTP_202_ACCEPTED)
            
            # Delete self match record if exists
            MilalMatching.objects.filter(
                match_date=local_date, milal_friend=milal_friend, volunteer=None).delete()

        # Save the instance
        self.perform_create(serializer)
        
        # Customize response if needed
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(
        detail=False,
        methods=["post"],
        url_path="unmatch",
        url_name="unmatch",
    )
    def unmatch(self, request, *args, **kwargs):
        
        data = request.data

        # Serialize the data
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        
        # Search and delete if match already exists for the day
        milal_friend = serializer.validated_data.get('milal_friend')
        volunteer = serializer.validated_data.get('volunteer')
        local_date = timezone.localtime(timezone.now()).date()
        MilalMatching.objects.filter(
            match_date=local_date, milal_friend=milal_friend, volunteer=volunteer).delete()

        # If self-match (aka no volunteer), delete self match record
        MilalMatching.objects.filter(
            match_date=local_date, milal_friend=milal_friend, volunteer=None).delete()

        # Customize response if needed
        return Response(status=status.HTTP_200_OK)

class VolunteerHoursViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing volunteer hours
    """

    permission_classes = [IsAuthenticated]

    queryset = VolunteerHours.objects.all().order_by("-created_at")
    serializer_class = VolunteerHoursSerializer
    filterset_fields = {
        "volunteer": ["exact", "isnull"],
        "email": ["exact"],
    }

    @action(
        detail=False,
        methods=["post"],
        url_path="bulk_create",
        url_name="bulk_create",
    )
    def bulk_create(self, request):

        volunteer_ids = request.data.pop("volunteer_ids")
        bulk_create_list = [{"volunteer": vId, **request.data} for vId in volunteer_ids]

        # Copied from CreateModelMixin
        serializer = self.get_serializer(data=bulk_create_list, many=True)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )
