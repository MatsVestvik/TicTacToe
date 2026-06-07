from math import inf

from tictactoe.rules import available_moves, check_winner, apply_move


def choose_move(board: list[str], bot_symbol: str, human_symbol: str) -> int | None:
    if check_winner(board) is not None:
        return None

    best_score = -inf
    best_move = None

    for move in available_moves(board):
        candidate = apply_move(board, move, bot_symbol)
        score = _minimax(candidate, depth=1, maximizing=False, bot_symbol=bot_symbol, human_symbol=human_symbol)
        if score > best_score:
            best_score = score
            best_move = move

    return best_move


def _minimax(board: list[str], depth: int, maximizing: bool, bot_symbol: str, human_symbol: str) -> int:
    winner = check_winner(board)
    if winner == bot_symbol:
        return 10 - depth
    if winner == human_symbol:
        return depth - 10
    if winner == "draw":
        return 0

    if maximizing:
        best = -inf
        symbol = bot_symbol
        for move in available_moves(board):
            candidate = apply_move(board, move, symbol)
            best = max(best, _minimax(candidate, depth + 1, False, bot_symbol, human_symbol))
        return int(best)

    best = inf
    symbol = human_symbol
    for move in available_moves(board):
        candidate = apply_move(board, move, symbol)
        best = min(best, _minimax(candidate, depth + 1, True, bot_symbol, human_symbol))
    return int(best)