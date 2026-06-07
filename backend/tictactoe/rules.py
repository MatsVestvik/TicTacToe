WIN_LINES = (
    (0, 1, 2),
    (3, 4, 5),
    (6, 7, 8),
    (0, 3, 6),
    (1, 4, 7),
    (2, 5, 8),
    (0, 4, 8),
    (2, 4, 6),
)

MOVE_PRIORITY = (4, 0, 2, 6, 8, 1, 3, 5, 7)


def empty_board() -> list[str]:
    return [""] * 9


def board_from_request(raw_board) -> list[str]:
    if not isinstance(raw_board, list) or len(raw_board) != 9:
        raise ValueError("board must be a list with exactly 9 cells.")

    board: list[str] = []
    for value in raw_board:
        if value not in {"", "X", "O"}:
            raise ValueError("board cells must be '', 'X', or 'O'.")
        board.append(value)
    return board


def apply_move(board: list[str], move: int, symbol: str) -> list[str]:
    if move < 0 or move > 8:
        raise ValueError("move must be between 0 and 8.")
    if board[move] != "":
        raise ValueError("That cell is already occupied.")
    if symbol not in {"X", "O"}:
        raise ValueError("symbol must be 'X' or 'O'.")

    next_board = board.copy()
    next_board[move] = symbol
    return next_board


def available_moves(board: list[str]) -> list[int]:
    return [move for move in MOVE_PRIORITY if board[move] == ""]


def check_winner(board: list[str]) -> str | None:
    for a, b, c in WIN_LINES:
        if board[a] and board[a] == board[b] == board[c]:
            return board[a]

    if "" not in board:
        return "draw"

    return None