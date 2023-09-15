from django.db import models
from common.models import BaseModel


class MilalMatching(BaseModel):
    match_date = models.DateField(auto_now_add=True, help_text="Date of matching")
    milal_friend = models.ForeignKey(
        "users.MilalFriend", on_delete=models.SET_NULL, null=True
    )
    volunteer = models.ForeignKey(
        "users.Volunteer", on_delete=models.SET_NULL, null=True
    )


class VolunteerHours(BaseModel):

    # Service Type / Hours Attributed
    SATURDAY_AGAPE = ("saturday_agape", 4.5)
    OTHER = ("other", None)

    SERVICE_TYPES = (
        (SATURDAY_AGAPE[0], "Saturday Agape"),
        (OTHER[0], "Other"),
    )

    volunteer = models.ForeignKey(
        "users.Volunteer", on_delete=models.SET_NULL, null=True
    )
    email = models.ForeignKey(
        "users.EmailAccount",
        on_delete=models.SET_NULL,
        null=True,
        help_text="Email account used to register the hours. Useful if volunteer account not created yet.",
    )
    service_type = models.CharField(
        choices=SERVICE_TYPES,
        max_length=30,
        help_text="Service type that hours were collected for",
    )
    service_date = models.DateTimeField(help_text="Datetime of service")
    hours = models.FloatField(help_text="Number of hours served for service type")
    description = models.TextField(
        null=True, help_text="Text field for holding misc data"
    )  # Use django signals, update on volunteer delete
