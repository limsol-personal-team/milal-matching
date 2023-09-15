from records.models import MilalMatching, VolunteerHours
from rest_framework import serializers


class MilalMatchingSerializer(serializers.ModelSerializer):
    class Meta:
        model = MilalMatching
        fields = "__all__"


class VolunteerHoursSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerHours
        fields = "__all__"
