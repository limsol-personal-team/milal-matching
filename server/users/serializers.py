from users.models import Volunteer, MilalFriend, EmailAccount
from rest_framework import serializers
from django.db.models import Sum


class VolunteerSerializer(serializers.ModelSerializer):
    hours = serializers.SerializerMethodField()

    def get_hours(self, obj):
        return obj.volunteerhours_set.aggregate(total=Sum("hours"))["total"]

    class Meta:
        model = Volunteer
        fields = "__all__"


class MilalFriendSerializer(serializers.ModelSerializer):
    class Meta:
        model = MilalFriend
        fields = "__all__"


class EmailAccountSerializer(serializers.ModelSerializer):
    def update(self, instance, validated_data):
        super().update(instance, validated_data)
        if "user" in validated_data.keys():
            instance.volunteerhours_set.update(volunteer=instance.user)
        return instance

    class Meta:
        model = EmailAccount
        fields = "__all__"
