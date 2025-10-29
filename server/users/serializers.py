from datetime import timedelta
from utils.decorators import cache_serializer_field
from collections import Counter
from users.models import Volunteer, MilalFriend, EmailAccount
from records.models import MilalMatching
from rest_framework import serializers
from django.db.models import Sum, Count
from django.utils import timezone
from users.utils import calculate_volunteer_hours_with_bonus

class VolunteerMixin:
    """Mixin containing common methods for Volunteer serializers"""
    
    def get_is_day_matched(self, obj):
        # Check if the queryset was prefetched with today's matches
        if hasattr(obj, '_prefetched_objects_cache') and 'today_matches' in obj._prefetched_objects_cache:
            return len(obj._prefetched_objects_cache['today_matches']) > 0
        
        # Fallback to individual query if not prefetched
        local_date = timezone.localtime(timezone.now()).date()
        milal_match = MilalMatching.objects.filter(match_date=local_date, volunteer=obj)
        return milal_match.exists()

class MilalFriendMixin:
    """Mixin containing common methods for MilalFriend serializers"""
    
    def get_is_day_matched(self, obj):
        # Check if the queryset was prefetched with today's matches
        if hasattr(obj, '_prefetched_objects_cache') and 'today_matches' in obj._prefetched_objects_cache:
            return len(obj._prefetched_objects_cache['today_matches']) > 0
        
        # Fallback to individual query if not prefetched
        local_date = timezone.localtime(timezone.now()).date()
        milal_match = MilalMatching.objects.filter(match_date=local_date, milal_friend=obj)
        return milal_match.exists()

class VolunteerListSerializer(VolunteerMixin, serializers.ModelSerializer):
    """Lightweight serializer for volunteer list"""
    is_day_matched = serializers.SerializerMethodField()
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Conditionally include is_day_matched field based on context
        include_day_matched = self.context.get('include_day_matched', False)
        if not include_day_matched:
            self.fields.pop('is_day_matched', None)
    
    class Meta:
        model = Volunteer
        fields = ['id', 'first_name', 'last_name', 'is_day_matched']

class MilalFriendListSerializer(MilalFriendMixin, serializers.ModelSerializer):
    """Lightweight serializer for Milal friend list """
    is_day_matched = serializers.SerializerMethodField()
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Conditionally include is_day_matched field based on context
        include_day_matched = self.context.get('include_day_matched', False)
        if not include_day_matched:
            self.fields.pop('is_day_matched', None)
    
    class Meta:
        model = MilalFriend
        fields = ['id', 'first_name', 'last_name', 'is_day_matched']

class VolunteerSerializer(VolunteerMixin, serializers.ModelSerializer):
    hours = serializers.SerializerMethodField()
    bonus_hours = serializers.SerializerMethodField()
    linked_emails = serializers.SerializerMethodField()
    is_day_matched = serializers.SerializerMethodField()
    recommended_match = serializers.SerializerMethodField()

    def get_hours(self, obj):
        return calculate_volunteer_hours_with_bonus(obj)[0]

    def get_bonus_hours(self, obj):
        return calculate_volunteer_hours_with_bonus(obj)[1]
    
    def get_linked_emails(self, obj):
        return obj.emailaccount_set.values_list("email", flat=True)

    @cache_serializer_field()
    def get_recommended_match(self, obj):
        filter_date = timezone.now() - timedelta(days=180)

        # Filter data for the last 6 months and group by 'friend'
        query = (
            MilalMatching.objects.filter(match_date__gte=filter_date, volunteer=obj)
            .values('milal_friend', 'milal_friend__first_name', 'milal_friend__last_name')
        )
        counter = Counter((item['milal_friend'], item['milal_friend__first_name'], 
                           item['milal_friend__last_name']) for item in query)
        
        # Convert the Counter back into a list of objects with counts and sort by count (descending)
        results = sorted(counter.items(), key=lambda x: x[1], reverse=True)

        # Self match will have null volunteer field
        formatted_result = [
            {
                "name": f"{key[1]} {key[2]}" if key[0] else "Self", 
                "count": count
            }
            for key, count in results
        ]

        return formatted_result

    class Meta:
        model = Volunteer
        fields = "__all__"


class MilalFriendSerializer(MilalFriendMixin, serializers.ModelSerializer):
    is_day_matched = serializers.SerializerMethodField()
    recommended_match = serializers.SerializerMethodField()

    @cache_serializer_field()
    def get_recommended_match(self, obj):
        filter_date = timezone.now() - timedelta(days=60)

        # Filter data for the last two months and group by 'volunteer'
        query = (
            MilalMatching.objects.filter(match_date__gte=filter_date, milal_friend=obj)
            .values('volunteer', 'volunteer__first_name', 'volunteer__last_name')
        )
        counter = Counter((item['volunteer'], item['volunteer__first_name'], 
                           item['volunteer__last_name']) for item in query)
        
        # Convert the Counter back into a list of objects with counts and sort by count (descending)
        results = sorted(counter.items(), key=lambda x: x[1], reverse=True)

        # Self match will have null volunteer field
        formatted_result = [
            {
                "name": f"{key[1]} {key[2]}" if key[0] else "Self", 
                "count": count
            }
            for key, count in results
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
