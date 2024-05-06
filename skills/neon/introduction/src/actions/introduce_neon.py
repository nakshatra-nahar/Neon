from bridges.python.src.sdk.neon import neon
from bridges.python.src.sdk.types import ActionParams
from ..lib import memory


def run(params: ActionParams) -> None:
    """neon introduces himself and ask about you if he does not know you yet"""
    owner = memory.get_owner()
    is_owner_saved = owner is not None

    if not is_owner_saved:
        return neon.answer({'key': 'neon_introduction_with_question'})

    return neon.answer({'key': 'neon_introduction'})
