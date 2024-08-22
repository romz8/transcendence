from django.db import IntegrityError

from app.models import Users
import logging
import random
import string

logger = logging.getLogger(__name__)

def namegenerator():
    numbers = [str(i) for i in range(42000)]
    leters = list(string.ascii_uppercase)
    animals = ["Lion", "Tiger", "Elephant", "Giraffe", "Rhinoceros", "Hippopotamus", "Zebra", "Crocodile", "Panda", "Koala"]
    sufix = ["Angry", "Annoying", "Aggressive", "Arrogant", "Creepy", "Crazy", "Cruel", "Dull", "Cute", "Adorable"]
    name = random.choice(animals)
    lastname = random.choice(sufix)
    num = random.choice(numbers)
    leter = random.choice(leters)
    fullname = f"{lastname}{name}{num}{leter}"
    return fullname


def recursiveNameGen(response):
    try:
        username = namegenerator()
        animal = random.choice(["penguin", "cat", "chicken"])
        img = '../assets/loginimg/' + animal + '.jpeg'
        Users.objects.create(
            id=username,
            alias=username,
            img=img,
            intra=False,
            name='',
            lastname='',
            campus='Campus of The Life'
        )
        response['user'] = username
        response['img'] = img
        logger.info("User:" + username)
    except IntegrityError:
        recursiveNameGen(response)