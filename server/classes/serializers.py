from classes.models import MilalMatching
from rest_framework import serializers


class MilalMatchingSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = MilalMatching
        fields = '__all__'
