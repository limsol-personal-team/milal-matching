from django.core.cache import cache
from functools import wraps

SERIALIZER_CACHE_KEY = "SERIALIZER_CACHE"

def cache_serializer_field(timeout=60*60):
    """
    A decorator to cache results of expensive serializer method fields.
    Arguments:
    - timeout (int): The cache timeout in seconds (default: 1 hour).
    """
    def decorator(func):
        @wraps(func)
        def wrapper(self, obj):
            # Generate a unique cache key for the method and object
            cache_key = f"{SERIALIZER_CACHE_KEY}_{func.__name__}_{obj.pk}"
            # Check if the result is cached
            result = cache.get(cache_key)
            if result is None:
                # If not cached, compute the result and cache it
                result = func(self, obj)
                cache.set(cache_key, result, timeout=timeout)
            return result
        return wrapper
    return decorator