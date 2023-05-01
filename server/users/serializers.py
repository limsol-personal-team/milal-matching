from users.models import Volunteer
from users.models import MilalFriend
from rest_framework import serializers


class VolunteerSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Volunteer
        fields = '__all__'

class MilalFriendSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = MilalFriend
        fields = '__all__'