from django.shortcuts import render
from django.views.generic import TemplateView
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from rest_framework import routers
from users import views as user_views
from records import views as records_views
from milalauth import views as auth_views

router = routers.DefaultRouter(trailing_slash=False)
router.register(r"email_accounts", user_views.EmailAccountViewSet)
router.register(r"volunteers", user_views.VolunteerViewSet)
router.register(r"milal_friends", user_views.MilalFriendViewSet)
router.register(r"records", records_views.MilalMatchingViewSet)
router.register(r"volunteer_hours", records_views.VolunteerHoursViewSet)
router.register(r"auth", auth_views.AuthViewSet, basename="auth")
router.register(r"cache", auth_views.CacheViewSet, basename="cache")

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    path("api/", include(router.urls)),
    path("admin/", admin.site.urls),
    path('ping', auth_views.PingView.as_view(), name='ping'),
]
