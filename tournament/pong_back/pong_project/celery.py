from __future__ import absolute_import, unicode_literals
import os
from celery import Celery
from celery.schedules import crontab  # For scheduling tasks
from django.conf import settings

# Establece el módulo de configuración de Django para Celery
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pong_project.settings')

app = Celery('pong_project')

# Cargar configuraciones de Django con el prefijo 'CELERY'
app.config_from_object('django.conf:settings', namespace='CELERY')

# Autodiscover tasks de las apps de Django
app.autodiscover_tasks()

# Configuraciones específicas para Celery Beat y Celery Worker
app.conf.beat_schedule_filename = settings.CELERY_BEAT_SCHEDULE_FILENAME

app.conf.beat_schedule = {
    'check-waitroom-expiry': {
        'task': 'game.tasks.clear_expired_waitrooms',
        'schedule': crontab(minute='*'),  # Every minutes
    },
    'manage-ai-players': {
        'task': 'game.tasks.manage_full_ai_match',
        'schedule': crontab(minute='*'),  # Every minutes
    },
}

app.conf.worker_state_db = settings.CELERY_WORKER_STATE_DB
