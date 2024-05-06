from bridges.python.src.sdk.neon import neon
from bridges.python.src.sdk.types import ActionParams
from ..lib import memory


def run(params: ActionParams) -> None:
    """Initialize session"""

    current_question = 1
    memory.upsert_session(current_question)

    return neon.answer({
        'key': str(current_question),
        'data': {
            'question': str(current_question)
        }
    })
