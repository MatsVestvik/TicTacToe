import os
import uuid
import time

from flask import Flask, jsonify, request


app = Flask(__name__)

waiting_queue = []
active_match = None
client_last_seen = {}
STALE_SECONDS = 20


def create_match(player_x, player_o):
	return {
		'id': str(uuid.uuid4()),
		'players': {
			'X': player_x,
			'O': player_o,
		},
		'board': [None] * 9,
		'nextPlayer': 'X',
		'winner': None,
		'isTie': False,
	}


def match_is_finished(match):
	return match['winner'] is not None or match['isTie']


def check_winner(board):
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


def ensure_match():
	global active_match

	if active_match is not None:
		return active_match

	if len(waiting_queue) < 2:
		return None

	player_x = waiting_queue.pop(0)
	player_o = waiting_queue.pop(0)
	active_match = create_match(player_x, player_o)
	return active_match


def touch_client(client_id):
	client_last_seen[client_id] = time.time()


def cleanup_stale_clients():
	global active_match

	now = time.time()
	stale_clients = {
		client_id
		for client_id, last_seen in client_last_seen.items()
		if now - last_seen > STALE_SECONDS
	}

	for client_id in stale_clients:
		client_last_seen.pop(client_id, None)
		remove_from_queue(client_id)

	if active_match is not None:
		player_x = active_match['players']['X']
		player_o = active_match['players']['O']
		if player_x in stale_clients or player_o in stale_clients:
			active_match = None


def client_symbol(client_id, match):
	if match['players']['X'] == client_id:
		return 'X'

	if match['players']['O'] == client_id:
		return 'O'

	return None


def current_status(client_id):
	touch_client(client_id)
	cleanup_stale_clients()
	match = ensure_match()

	if match is not None and client_symbol(client_id, match):
		return {
			'state': 'matched' if not match_is_finished(match) else 'finished',
			'symbol': client_symbol(client_id, match),
			'queuePosition': None,
			'match': {
				'id': match['id'],
				'board': match['board'],
				'nextPlayer': match['nextPlayer'],
				'winner': match['winner'],
				'isTie': match['isTie'],
			},
		}

	if client_id in waiting_queue:
		return {
			'state': 'queued',
			'symbol': None,
			'queuePosition': waiting_queue.index(client_id) + 1,
			'match': None,
		}

	return {
		'state': 'idle',
		'symbol': None,
		'queuePosition': None,
		'match': None,
	}


def remove_from_queue(client_id):
	while client_id in waiting_queue:
		waiting_queue.remove(client_id)


def end_match():
	global active_match

	active_match = None
	ensure_match()


@app.after_request
def add_cors_headers(response):
	response.headers['Access-Control-Allow-Origin'] = '*'
	response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
	response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
	return response


@app.route('/api/multiplayer/join', methods=['POST'])
def multiplayer_join():
	data = request.get_json(silent=True) or {}
	client_id = str(data.get('clientId') or request.args.get('clientId') or '').strip()

	if not client_id:
		return jsonify(error='clientId is required'), 400

	global active_match
	touch_client(client_id)
	cleanup_stale_clients()

	if active_match is not None and client_symbol(client_id, active_match):
		return jsonify(status=current_status(client_id))

	if client_id not in waiting_queue:
		waiting_queue.append(client_id)

	ensure_match()
	return jsonify(status=current_status(client_id))


@app.route('/api/multiplayer/status', methods=['GET'])
def multiplayer_status():
	client_id = str(request.args.get('clientId') or '').strip()

	if not client_id:
		return jsonify(error='clientId is required'), 400

	return jsonify(status=current_status(client_id))


@app.route('/api/multiplayer/leave', methods=['POST'])
def multiplayer_leave():
	data = request.get_json(silent=True) or {}
	client_id = str(data.get('clientId') or request.args.get('clientId') or '').strip()

	if not client_id:
		return jsonify(error='clientId is required'), 400

	global active_match
	touch_client(client_id)
	cleanup_stale_clients()

	remove_from_queue(client_id)

	if active_match is not None and client_symbol(client_id, active_match):
		end_match()

	return jsonify(status=current_status(client_id))


@app.route('/api/game/move', methods=['POST'])
def make_move():
	global active_match

	data = request.get_json(silent=True) or {}
	client_id = str(data.get('clientId') or request.args.get('clientId') or '').strip()
	index_value = data.get('index', request.args.get('index', ''))

	if not client_id:
		return jsonify(error='clientId is required'), 400

	if active_match is None:
		return jsonify(error='no active match'), 409

	touch_client(client_id)
	cleanup_stale_clients()

	symbol = client_symbol(client_id, active_match)
	if symbol is None:
		return jsonify(error='you are not part of this match'), 403

	try:
		index = int(index_value)
	except (TypeError, ValueError):
		return jsonify(error='index must be a number from 0 to 8'), 400

	if index < 0 or index > 8:
		return jsonify(error='index must be between 0 and 8'), 400

	if match_is_finished(active_match):
		return jsonify(error='match is already finished', state=current_status(client_id)), 409

	if symbol != active_match['nextPlayer']:
		return jsonify(error='not your turn', state=current_status(client_id)), 409

	if active_match['board'][index] is not None:
		return jsonify(error='cell already taken', state=current_status(client_id)), 409

	active_match['board'][index] = symbol

	winner = check_winner(active_match['board'])
	if winner:
		active_match['winner'] = winner
	elif all(cell is not None for cell in active_match['board']):
		active_match['isTie'] = True
	else:
		active_match['nextPlayer'] = 'O' if active_match['nextPlayer'] == 'X' else 'X'

	return jsonify(status=current_status(client_id))


@app.route('/api/game/reset', methods=['POST'])
def reset_game():
	global active_match

	data = request.get_json(silent=True) or {}
	client_id = str(data.get('clientId') or request.args.get('clientId') or '').strip()

	if not client_id:
		return jsonify(error='clientId is required'), 400

	if active_match is None:
		return jsonify(error='no active match'), 409

	touch_client(client_id)
	cleanup_stale_clients()

	if client_symbol(client_id, active_match) is None:
		return jsonify(error='you are not part of this match'), 403

	active_match['board'] = [None] * 9
	active_match['nextPlayer'] = 'X'
	active_match['winner'] = None
	active_match['isTie'] = False

	return jsonify(status=current_status(client_id))


@app.route('/api/game/state', methods=['GET'])
def game_state():
	client_id = str(request.args.get('clientId') or '').strip()

	if not client_id:
		return jsonify(error='clientId is required'), 400

	return jsonify(status=current_status(client_id))


if __name__ == '__main__':
	app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=True)