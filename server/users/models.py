from django.db import models
from common.models import BaseModel


class Person(BaseModel):
    description = models.TextField(
        null=True
    )
    dob = models.DateField()
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)

    class Meta:
        abstract = True


class Volunteer(Person):
    active = models.BooleanField(default=False)
    graduation_year = models.PositiveSmallIntegerField(
        null=True
    )


class MilalFriend(Person):
    active = models.BooleanField(default=False)
