from bridges.python.src.sdk.neon import neon
from bridges.python.src.sdk.types import ActionParams
from bridges.python.src.sdk.memory import Memory

from datetime import datetime
from random import randint
from typing import TypedDict


class Owner(TypedDict):
    name: str
    birth_date: str


def run(params: ActionParams) -> None:
    """neon greets you"""

    time = datetime.time(datetime.now())

    # 1/2 chance to get deeper greetings
    if randint(0, 1) != 0:
        if time.hour >= 5 and time.hour <= 10:
            return neon.answer({'key': 'morning_good_day'})
        if time.hour == 11:
            return neon.answer({'key': 'morning'})
        if time.hour >= 12 and time.hour <= 17:
            return neon.answer({'key': 'afternoon'})
        if time.hour >= 18 and time.hour <= 21:
            return neon.answer({'key': 'evening'})
        if time.hour >= 22 and time.hour <= 23:
            return neon.answer({'key': 'night'})

        return neon.answer({'key': 'too_late'})

    try:
        owner_memory = Memory({'name': 'neon:introduction:owner'})
        owner: Owner = owner_memory.read()
        neon.answer({
            'key': 'default_with_name',
            'data': {
                'owner_name': owner['name'],
            }
        })
    except BaseException:
        return neon.answer({'key': 'default'})
