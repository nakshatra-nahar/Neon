from bridges.python.src.sdk.neon import neon
from bridges.python.src.sdk.types import ActionParams

from ..lib import memory


def run(params: ActionParams) -> None:
    """Take decision about whether to replay"""

    memory.game_memory.clear()
    resolvers = params['resolvers']
    decision = False

    for resolver in resolvers:
        if resolver['name'] == 'affirmation_denial':
            decision = resolver['value']

    if decision:
        neon.answer({
            'key': 'replay',
            'core': {
                'isInActionLoop': False,
                'restart': True
            }
        })
        return

    neon.answer({
        'key': 'stop',
        'core': {
            'isInActionLoop': False
        }
    })
