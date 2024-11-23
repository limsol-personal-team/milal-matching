from records.models import MilalMatching, VolunteerHours
from rest_framework import serializers

from users.serializers import MilalFriendSerializer, VolunteerSerializer


class MilalMatchingSerializer(serializers.ModelSerializer):
    class Meta:
        model = MilalMatching
        fields = "__all__"
    
    # Serialize nested data structure in response
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['milal_friend'] = MilalFriendSerializer(instance.milal_friend).data if instance.milal_friend else None
        rep['volunteer'] = VolunteerSerializer(instance.volunteer).data if instance.volunteer else None
        return rep


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
