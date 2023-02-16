from django.db import models
from common.models import BaseModel

class MilalMatching(BaseModel):
    match_date = models.DateField(auto_now_add=True)
    milal_friend = models.ForeignKey(
        'users.MilalFriend',
        on_delete=models.SET_NULL
    )
    volunteer = models.ForeignKey(
        'users.Volunteer',
        on_delete=models.SET_NULL
    )