from rest_framework import viewsets, status
from rest_framework.throttling import AnonRateThrottle
from rest_framework.decorators import action
from rest_framework.response import Response
from authz.permissions import HasAdminPermission
from users.serializers import EmailAccountSerializer
from users.models import Volunteer, MilalFriend, EmailAccount
from users.serializers import VolunteerSerializer, MilalFriendSerializer, VolunteerListSerializer, MilalFriendListSerializer
from records.models import VolunteerHours
from django.utils import timezone
from datetime import timedelta
from datetime import datetime


class VolunteerViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows volunteers to be viewed or edited.
    """

    permission_classes = [HasAdminPermission]

    queryset = Volunteer.objects.all().order_by("first_name")
    serializer_class = VolunteerSerializer
    filterset_fields = {
        "id": ["exact"],
        "first_name": ["icontains"],
        "last_name": ["icontains"],
        "active": ["exact"],
    }

    @action(detail=False, methods=['post'])
    def update_active_state(self, request):
        """
        Update the active state of all volunteers based on:
        1. If volunteer was created within the cutoff date, OR
        2. If volunteer has volunteer hours with service_date within the cutoff date
        
        Optional parameters:
        - cutoff_date: ISO format date string (e.g., "2024-01-01"). 
          If not provided, defaults to 1 year ago from now.
        """
        # Get cutoff date from request or default to 1 year ago
        cutoff_date_str = request.data.get('cutoff_date')
        
        if cutoff_date_str:
            try:
                # Parse as naive datetime (assumed to be in local time)
                cutoff_date = datetime.fromisoformat(cutoff_date_str)
                # Make it timezone-aware in the server's local timezone
                cutoff_date = timezone.make_aware(cutoff_date)
            except ValueError:
                return Response({
                    'error': 'Invalid cutoff_date format. Use ISO format (e.g., "2024-01-01")'
                }, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Default to 1 year ago from now
            cutoff_date = timezone.now() - timedelta(days=365)
        
        # Get all volunteers
        volunteers = Volunteer.objects.all()
        updated_count = 0
        
        for volunteer in volunteers:
            # Check if volunteer was created within the cutoff date
            created_within_cutoff = volunteer.created_at >= cutoff_date
            
            # Check if volunteer has hours within the cutoff date
            has_recent_hours = VolunteerHours.objects.filter(
                volunteer=volunteer,
                service_date__gte=cutoff_date
            ).exists()
            
            # Determine if volunteer should be active
            should_be_active = created_within_cutoff or has_recent_hours
            
            # Update if the active state needs to change
            if volunteer.active != should_be_active:
                volunteer.active = should_be_active
                volunteer.save()
                updated_count += 1
        
        return Response({
            'success': True,
            'message': f'Updated active state for {updated_count} volunteer(s)',
            'updated_count': updated_count,
            'total_volunteers': volunteers.count(),
            'cutoff_date': cutoff_date.strftime('%Y-%m-%d')
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def list_lightweight(self, request):
        """
        Return a lightweight list of volunteers with only ID and name.
        Useful for populating dropdowns and lists without loading full volunteer data.
        """
        queryset = self.filter_queryset(self.get_queryset())
        serializer = VolunteerListSerializer(queryset, many=True)
        return Response(serializer.data)


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
        "active": ["exact"],
    }

    @action(detail=False, methods=['get'])
    def list_lightweight(self, request):
        """
        Return a lightweight list of Milal friends with only ID and name.
        Useful for populating dropdowns and lists without loading full Milal friend data.
        """
        queryset = self.filter_queryset(self.get_queryset())
        serializer = MilalFriendListSerializer(queryset, many=True)
        return Response(serializer.data)


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