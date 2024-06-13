from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import logging
import json

logger = logging.getLogger(__name__)

def checkCred(usr, mail, pws):
    logger.info(usr)
    logger.info(mail)
    logger.info(pws)

@csrf_exempt
def enviar_mensaje(request):
    body = json.loads(request.body.decode('utf-8'))
    logger.info(body)
    if request.method == "GET":
        response = {'respuest': 'GET'}
        msg = request.GET.get('msg')
        response['msg'] = msg
    elif request.method == "POST":
        response = {'respuest': 'POST'}
        response['msg'] = request.POST.get('msg')
        usr = request.POST.get('user')
        mail = request.POST.get('mail')
        psw = request.POST.get('psw')
        checkCred(usr, mail, psw)
    return JsonResponse(response)

def obtener_respuesta(request):
    respuesta = {'respuesta': 'Respuesta del backend'}
    return JsonResponse(respuesta)
