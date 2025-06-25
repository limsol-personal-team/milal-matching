import math
from django.db.models import Sum


def round_to_nearest_half(value):
    """Round a value up to the nearest 0.5 or whole integer"""
    # Multiply by 2 to work with integers
    doubled = value * 2
    # Use math.ceil to round up, then divide by 2
    return math.ceil(doubled) / 2


def calculate_volunteer_hours_with_bonus(volunteer, hours_queryset=None):
    """
    Calculate total volunteer hours including bonus percentage and return both total hours and bonus hours.
    
    Args:
        volunteer: Volunteer instance
        hours_queryset: Optional queryset of VolunteerHours. If None, will use volunteer.volunteerhours_set
    
    Returns:
        float: Total hours including bonus (rounded up to nearest 0.5)
        float: Bonus hours (rounded up to nearest 0.5)
    """
    if hours_queryset is None:
        hours_queryset = volunteer.volunteerhours_set
    
    total_hours = hours_queryset.aggregate(total=Sum("hours"))["total"] or 0
    
    # Apply bonus percentage if set
    if volunteer.bonus_percentage and volunteer.bonus_percentage > 0:
        bonus_hours = (total_hours * volunteer.bonus_percentage) / 100
        rounded_bonus_hours = round_to_nearest_half(bonus_hours)
        return total_hours + rounded_bonus_hours, rounded_bonus_hours
    
    return total_hours, 0