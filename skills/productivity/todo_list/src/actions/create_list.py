from bridges.python.src.sdk.neon import neon
from bridges.python.src.sdk.types import ActionParams
from ..lib import memory

from typing import Union


def run(params: ActionParams) -> None:
    """Create a to-do list"""

    list_name: Union[str, None] = None

    for item in params['entities']:
        if item['entity'] == 'list':
            list_name = item['sourceText'].lower()

    if list_name is None:
        return neon.answer({'key': 'list_not_provided'})

    if memory.has_todo_list(list_name):
        return neon.answer({
            'key': 'list_already_exists',
            'data': {
                'list': list_name
            }
        })

    memory.create_todo_list(list_name)

    neon.answer({
        'key': 'list_created',
        'data': {
            'list': list_name
        }
    })
