from django.conf.urls import url, include
from rest_framework import routers
from users import views as user_views
from classes import views as classes_views

router = routers.DefaultRouter()
router.register(r'volunteers', user_views.VolunteerViewSet)
router.register(r'classes', classes_views.MilalMatchingViewSet)

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    url('', include(router.urls)),
    url('api-auth/', include('rest_framework.urls', namespace='rest_framework'))
]
