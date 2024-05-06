from bridges.python.src.sdk.neon import neon
from bridges.python.src.sdk.types import ActionParams

import random


def run(params: ActionParams) -> None:
    """Define the winner"""

    handsigns = {
        'ROCK': {
            'superior_to': 'SCISSORS',
            'inferior_to': 'PAPER',
            'emoji': '✊'
        },
        'PAPER': {
            'superior_to': 'ROCK',
            'inferior_to': 'SCISSORS',
            'emoji': '✋'
        },
        'SCISSORS': {
            'superior_to': 'PAPER',
            'inferior_to': 'ROCK',
            'emoji': '✌'
        }
    }
    entities = params['entities']
    player = {
        'handsign': None,
        'points': 0
    }
    neon_player = {
        'handsign': random.choice(list(handsigns)),
        'points': 0
    }

    # Find entities
    for entity in entities:
        if entity['entity'] == 'handsign':
            player['handsign'] = entity['option']

    # Exit the loop if no handsign has been found
    if player['handsign'] is None:
        neon.answer({'core': {'isInActionLoop': False}})

    neon_emoji = handsigns[neon_player['handsign']]['emoji']
    player_emoji = handsigns[player['handsign']]['emoji']

    neon.answer({'key': 'neon_emoji', 'data': {'neon_emoji': neon_emoji}})

    if neon_player['handsign'] == player['handsign']:
        neon.answer({'key': 'equal'})

    # Point for neon
    elif handsigns[neon_player['handsign']]['superior_to'] == player['handsign']:
        neon.answer({
            'key': 'point_for_neon',
            'data': {
                'handsign_1': neon_player['handsign'].lower(),
                'handsign_2': player['handsign'].lower()
            }
        })

    else:
        neon.answer({
            'key': 'point_for_player',
            'data': {
                'handsign_1': player['handsign'].lower(),
                'handsign_2': neon_player['handsign'].lower()
            }
        })

    neon.answer({
        'key': 'ask_for_rematch',
        'core': {
            'isInActionLoop': False,
            'showNextActionSuggestions': True
        }
    })
