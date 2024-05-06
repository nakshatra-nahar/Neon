from bridges.python.src.sdk.neon import neon
from bridges.python.src.sdk.types import ActionParams


def run(params: ActionParams) -> None:
    """Ask for a retry"""

    resolvers = params['resolvers']
    decision = False

    for resolver in resolvers:
        if resolver['name'] == 'affirmation_denial':
            decision = resolver['value']

    if decision:
        return neon.answer({
            'key': 'confirm_retry',
            'core': {
                'isInActionLoop': False,
                'restart': True
            }
        })

    neon.answer({
        'key': 'deny_retry',
        'core': {
            'isInActionLoop': False
        }
    })
