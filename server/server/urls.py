from django.urls import path, include
from rest_framework import routers
from users import views as user_views
from classes import views as classes_views
from milalauth import views as auth_views

router = routers.DefaultRouter()
router.register(r"volunteers", user_views.VolunteerViewSet)
router.register(r"classes", classes_views.MilalMatchingViewSet)
router.register(r"auth", auth_views.AuthViewSet, basename="auth")

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    path("", include(router.urls)),
    path("api-auth/", include("rest_framework.urls", namespace="rest_framework")),
]
