from bridges.python.src.sdk.neon import neon
from bridges.python.src.sdk.types import ActionParams
from random import randint

from ..lib import memory


def run(params: ActionParams) -> None:
    """Init the number to guess"""
    number_to_guess = randint(1, 100)
    memory.create_new_game(number_to_guess)
    neon.answer({'key': 'ready'})
