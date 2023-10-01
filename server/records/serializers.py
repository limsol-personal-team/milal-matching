from records.models import MilalMatching, VolunteerHours
from rest_framework import serializers


class MilalMatchingSerializer(serializers.ModelSerializer):
    class Meta:
        model = MilalMatching
        fields = "__all__"


# https://www.django-rest-framework.org/api-guide/serializers/#listserializer
class VolunteerHoursListSerializer(serializers.ListSerializer):
    def create(self, validated_data):
        books = [VolunteerHours(**item) for item in validated_data]
        return VolunteerHours.objects.bulk_create(books)


class VolunteerHoursSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerHours
        fields = "__all__"
        list_serializer_class = VolunteerHoursListSerializer
