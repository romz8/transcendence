from __future__ import absolute_import, unicode_literals
import os
from celery import Celery
from celery.schedules import crontab  # For scheduling tasks

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pong_project.settings')

app = Celery('pong_project')

app.config_from_object('django.conf:settings', namespace='CELERY')

app.autodiscover_tasks()

# Define a schedule for Celery Beat -> added 
app.conf.beat_schedule = {
    'check-waitroom-expiry': {
        'task': 'game.tasks.clear_expired_waitrooms',
        'schedule': crontab(minute='*/3'),  # Every minutes
    },
    'manage-ai-players': {
        'task': 'game.tasks.manage_full_ai_match',
        'schedule': crontab(minute='*/3'),  # Every minutes
    },
}