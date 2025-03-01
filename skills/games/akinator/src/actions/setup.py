from bridges.python.src.sdk.neon import neon
from bridges.python.src.sdk.types import ActionParams
from ..lib import akinator, memory


def run(params: ActionParams) -> None:
    """Initialize new session"""

    neon.answer({'key': 'calling_akinator'})

    slots, lang = params['slots'], params['lang']
    thematic = slots['thematic']['resolution']['value']
    theme_lang = lang
    if thematic != 'characters':
        theme_lang = lang + '_' + thematic

    try:
        aki = akinator.Akinator()

        q = aki.start_game(theme_lang)

        memory.upsert_session({
            'response': aki.response,
            'session': aki.session,
            'progression': aki.progression,
            'signature': aki.signature,
            'uri': aki.uri,
            'timestamp': aki.timestamp,
            'server': aki.server,
            'child_mode': aki.child_mode,
            'frontaddr': aki.frontaddr,
            'question_filter': aki.question_filter
        })

        neon.answer({
            'key': q,
            'core': {
                'showNextActionSuggestions': True
            }
        })
    except BaseException:
        neon.answer({'key': 'network_error'})
