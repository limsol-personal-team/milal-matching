from rest_framework import viewsets
from classes.models import MilalMatching
from classes.serializers import MilalMatchingSerializer


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
