from rest_framework.throttling import AnonRateThrottle

class NoThrottle(AnonRateThrottle):
    def allow_request(self, request, view):
        # Check if the request is for the PingView
        # Import in method to prevent circular dependency issue
        from milalauth.views import PingView
        if isinstance(view, PingView):
            return True  # Always allow requests to the PingView (no throttling)
        return super().allow_request(request, view)
