from rest_framework import viewsets
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
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
