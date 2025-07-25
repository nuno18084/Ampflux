from celery import Celery
import os

CELERY_BROKER_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
CELERY_RESULT_BACKEND = CELERY_BROKER_URL

celery_app = Celery(
    "ampflux",
    broker=CELERY_BROKER_URL,
    backend=CELERY_RESULT_BACKEND
)

celery_app.conf.task_routes = {
    "app.tasks.*": {"queue": "default"},
}

