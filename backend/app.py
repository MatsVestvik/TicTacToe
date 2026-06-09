import os

from flask import Flask, jsonify, request


app = Flask(__name__)

board = [None] * 9
next_player = 'X'
winner = None
is_tie = False


def get_game_state():
    return {
        'board': board,
        'nextPlayer': next_player,
        'winner': winner,
        'isTie': is_tie,
    }


def check_winner():
    winning_lines = (
        (0, 1, 2),
        (3, 4, 5),
        (6, 7, 8),
        (0, 3, 6),
        (1, 4, 7),
        (2, 5, 8),
        (0, 4, 8),
        (2, 4, 6),
    )

    for first, second, third in winning_lines:
        if board[first] and board[first] == board[second] == board[third]:
            return board[first]

    return None


@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    return response


@app.route('/api/game', methods=['GET'])
def get_game():
    return jsonify(get_game_state())


@app.route('/api/game/move', methods=['POST'])
def make_move():
    global next_player, winner, is_tie

    player = request.args.get('player', '').upper()
    index_value = request.args.get('index', '')

    if player not in {'X', 'O'}:
        return jsonify(error='player must be X or O', state=get_game_state()), 400

    try:
        index = int(index_value)
    except (TypeError, ValueError):
        return jsonify(error='index must be a number from 0 to 8', state=get_game_state()), 400

    if index < 0 or index > 8:
        return jsonify(error='index must be between 0 and 8', state=get_game_state()), 400

    if winner or is_tie:
        return jsonify(error='game is over', state=get_game_state()), 409

    if player != next_player:
        return jsonify(error='not your turn', state=get_game_state()), 409

    if board[index] is not None:
        return jsonify(error='cell already taken', state=get_game_state()), 409

    board[index] = player

    found_winner = check_winner()
    if found_winner:
        winner = found_winner
    elif all(cell is not None for cell in board):
        is_tie = True
    else:
        next_player = 'O' if next_player == 'X' else 'X'

    return jsonify(state=get_game_state())


@app.route('/api/game/reset', methods=['POST'])
def reset_game():
    global board, next_player, winner, is_tie

    board = [None] * 9
    next_player = 'X'
    winner = None
    is_tie = False

    return jsonify(state=get_game_state())


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=True)