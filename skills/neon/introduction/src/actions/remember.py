from bridges.python.src.sdk.neon import neon
from bridges.python.src.sdk.types import ActionParams
from ..lib import memory


def run(params: ActionParams) -> None:
    """Save name and birthdate into neon's memory"""
    slots = params['slots']
    owner_name = slots['owner_name']['resolution']['value']
    owner_birth_date = slots['owner_birth_date']['resolution']['timex']

    owner: memory.Owner = {
        'name': owner_name,
        'birth_date': owner_birth_date
    }
    memory.upsert_owner(owner)

    neon.answer({
        'key': 'remembered',
        'data': {
            'owner_name': owner_name
        }
    })
