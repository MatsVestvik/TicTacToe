# TicTacToe Full-Stack Starter

This project uses a Python backend and a JavaScript browser frontend to build a playable TicTacToe game.

## Structure

- `backend/` - Flask app, game rules, and bot logic
- `backend/templates/` - HTML served by Flask
- `backend/static/` - browser JavaScript and CSS

## How it works

- The browser loads the game board and sends moves to the Python backend.
- The backend validates the move, applies the bot's response, and returns the updated board state.
- The bot uses minimax, so it will play optimally.

## Run it

1. Install Flask: `pip install -r backend/requirements.txt`
2. Start the backend: `python backend/app.py`
3. Open `http://127.0.0.1:5000`

If you want, I can later turn this into a React frontend or add difficulty levels for the bot.