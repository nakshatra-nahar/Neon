from bridges.python.src.sdk.neon import neon
from bridges.python.src.sdk.types import ActionParams

from random import randint


def run(params: ActionParams) -> None:
    """neon gives a random number"""
    neon.answer({
        'key': 'answer',
        'data': {
            'answer': randint(0, 100)
        }
    })
