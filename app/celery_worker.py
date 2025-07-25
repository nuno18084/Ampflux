from celery import Celery
from .config import CELERY_BROKER_URL, CELERY_RESULT_BACKEND

celery_app = Celery(
    "ampflux",
    broker=CELERY_BROKER_URL,
    backend=CELERY_RESULT_BACKEND
) 