from django.db import models
from common.models import BaseModel


class Person(BaseModel):
    description = models.TextField(
        blank=True, default="", help_text="Text field for holding misc data"
    )
    dob = models.DateField(null=True)
    first_name = models.CharField(max_length=25)
    last_name = models.CharField(max_length=25)

    class Meta:
        abstract = True


class Volunteer(Person):
    active = models.BooleanField(
        default=True, help_text="Active status for volunteer. Used for soft deletes"
    )
    graduation_year = models.PositiveSmallIntegerField(
        null=True, help_text="HS Graduation year"
    )


class MilalFriend(Person):
    active = models.BooleanField(default=True)


class EmailAccount(BaseModel):
    user = models.ForeignKey("users.Volunteer", on_delete=models.SET_NULL, null=True)
    email = models.CharField(help_text="Email address", max_length=50)
    display_name = models.CharField(
        help_text="Display name set for email account", max_length=50
    )
