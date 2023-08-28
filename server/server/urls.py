from django.shortcuts import render
from django.views.generic import TemplateView
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
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
    path("api/", include(router.urls)),
    re_path(r"^(?:.*)/?$", TemplateView.as_view(template_name="index.html")),
]
