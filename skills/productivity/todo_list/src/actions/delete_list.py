from bridges.python.src.sdk.neon import neon
from bridges.python.src.sdk.types import ActionParams
from ..lib import memory

from typing import Union


def run(params: ActionParams) -> None:
    """Delete a to-do list"""

    list_name: Union[str, None] = None

    for item in params['entities']:
        if item['entity'] == 'list':
            list_name = item['sourceText'].lower()

    if list_name is None:
        return neon.answer({'key': 'list_not_provided'})

    if not memory.has_todo_list(list_name):
        return neon.answer({
            'key': 'list_does_not_exist',
            'data': {
                'list': list_name
            }
        })

    memory.delete_todo_list(list_name)

    neon.answer({
        'key': 'list_deleted',
        'data': {
            'list': list_name
        }
    })
