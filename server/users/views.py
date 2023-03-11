from rest_framework import viewsets
from users.models import Volunteer
from users.serializers import VolunteerSerializer


class VolunteerViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows volunteer to be viewed or edited.
    """
    queryset = Volunteer.objects.all().order_by('-first_name')
    serializer_class = VolunteerSerializer
