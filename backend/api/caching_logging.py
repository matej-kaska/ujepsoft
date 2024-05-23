from django_redis.cache import RedisCache
import logging
from utils import REDIS_TIMEOUT

logger = logging.getLogger(__name__)

class LoggingRedisCache(RedisCache):
  def get(self, key, default=None, version=None):
    value = super().get(key, default, version)
    logger.debug(f'Cache get: {key}, Hit: {"Yes" if value is not None else "No"}')
    return value

  def set(self, key, value, timeout=REDIS_TIMEOUT, version=None):
    super().set(key, value, timeout, version)
    logger.debug(f'Cache set: {key}')