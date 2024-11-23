from datetime import timedelta
from utils.decorators import cache_serializer_field
from users.models import Volunteer, MilalFriend, EmailAccount
from records.models import MilalMatching
from rest_framework import serializers
from django.db.models import Sum, Count
from django.utils import timezone

class VolunteerSerializer(serializers.ModelSerializer):
    hours = serializers.SerializerMethodField()
    linked_emails = serializers.SerializerMethodField()
    is_day_matched = serializers.SerializerMethodField()
    recommended_match = serializers.SerializerMethodField()

    def get_hours(self, obj):
        return obj.volunteerhours_set.aggregate(total=Sum("hours"))["total"]
    
    @cache_serializer_field()
    def get_linked_emails(self, obj):
        return obj.emailaccount_set.values_list("email", flat=True)

    def get_is_day_matched(self, obj):
        local_date = timezone.localtime(timezone.now()).date()
        milal_match = MilalMatching.objects.filter(match_date=local_date, volunteer=obj)
        return milal_match.exists()

    @cache_serializer_field()
    def get_recommended_match(seof, obj):
        filter_date = timezone.now() - timedelta(days=60)
        # Filter data for the last two months and group by 'friend'
        query = (
            MilalMatching.objects.filter(match_date__gte=filter_date, volunteer=obj)
            .values('milal_friend', 'milal_friend__first_name', 'milal_friend__last_name')
            .annotate(count=Count('milal_friend'))
            .order_by('-count')
        )
        formatted_result = [
            {
                "name": f"{item['milal_friend__first_name']} {item['milal_friend__last_name']}",
                "count": item["count"]
            }
            for item in query
        ]
        return formatted_result


    class Meta:
        model = Volunteer
        fields = "__all__"


class MilalFriendSerializer(serializers.ModelSerializer):
    is_day_matched = serializers.SerializerMethodField()
    recommended_match = serializers.SerializerMethodField()

    def get_is_day_matched(self, obj):
        local_date = timezone.localtime(timezone.now()).date()
        milal_match = MilalMatching.objects.filter(match_date=local_date, milal_friend=obj)
        return milal_match.exists()
    
    @cache_serializer_field()
    def get_recommended_match(seof, obj):
        filter_date = timezone.now() - timedelta(days=60)
        # Filter data for the last two months and group by 'friend'
        query = (
            MilalMatching.objects.filter(match_date__gte=filter_date, milal_friend=obj)
            .values('volunteer', 'volunteer__first_name', 'volunteer__last_name')
            .annotate(count=Count('volunteer'))
            .order_by('-count')
        )
        formatted_result = [
            {
                "name": f"{item['volunteer__first_name']} {item['volunteer__last_name']}",
                "count": item["count"]
            }
            for item in query
        ]
        return formatted_result

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
