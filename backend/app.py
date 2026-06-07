from flask import Flask, jsonify, render_template, request

from tictactoe.bot import choose_move
from tictactoe.rules import apply_move, board_from_request, check_winner, empty_board


app = Flask(__name__)


@app.get("/")
def home():
    return render_template("index.html")


@app.get("/api/new-game")
def new_game():
    return jsonify(
        board=empty_board(),
        human_symbol="X",
        bot_symbol="O",
        turn="human",
        winner=None,
        message="New game started",
    )


@app.post("/api/play")
def play():
    data = request.get_json(silent=True) or {}
    board = board_from_request(data.get("board"))
    human_symbol = data.get("human_symbol", "X")
    bot_symbol = data.get("bot_symbol", "O")

    if human_symbol == bot_symbol:
        return jsonify(error="Human and bot symbols must be different."), 400

    move = data.get("human_move")
    if not isinstance(move, int):
        return jsonify(error="human_move must be an integer."), 400

    try:
        board = apply_move(board, move, human_symbol)
    except ValueError as exc:
        return jsonify(error=str(exc)), 400

    winner = check_winner(board)
    if winner is not None:
        return jsonify(
            board=board,
            human_symbol=human_symbol,
            bot_symbol=bot_symbol,
            turn=None,
            winner=winner,
            bot_move=None,
            message=_message_for_winner(winner),
        )

    bot_move = choose_move(board, bot_symbol=bot_symbol, human_symbol=human_symbol)
    if bot_move is not None:
        board = apply_move(board, bot_move, bot_symbol)

    winner = check_winner(board)
    if winner is None:
        message = "Your turn"
        turn = "human"
    else:
        message = _message_for_winner(winner)
        turn = None

    return jsonify(
        board=board,
        human_symbol=human_symbol,
        bot_symbol=bot_symbol,
        turn=turn,
        winner=winner,
        bot_move=bot_move,
        message=message,
    )


def _message_for_winner(winner: str) -> str:
    if winner == "draw":
        return "It's a draw."
    return f"{winner} wins."


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)