from rest_framework import viewsets
from records.models import MilalMatching, VolunteerHours
from records.serializers import MilalMatchingSerializer, VolunteerHoursSerializer


class MilalMatchingViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing Milal Matching
    """

    queryset = MilalMatching.objects.all().order_by("-created_at")
    serializer_class = MilalMatchingSerializer
    filter_fields = {
        "created_at": ["gte", "lte", "exact", "gt", "lt"],
        "match_date": ["gte", "lte", "exact", "gt", "lt"],
    }


class VolunteerHoursViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing volunteer hours
    """

    queryset = VolunteerHours.objects.all().order_by("-created_at")
    serializer_class = VolunteerHoursSerializer
    filterset_fields = {
        "volunteer": ["exact", "isnull"],
        "email": ["exact"],
    }
