# Tic Tac Toe

This project is a simple two-device tic-tac-toe game.

## How it works

- The browser loads `Client/index.html`.
- `Client/main.js` renders the board, lets a player join as `X` or `O`, and polls the backend for updates.
- `backend/app.py` stores the shared board in memory and enforces turns, wins, and ties.

## Run locally

1. Open PowerShell.
2. Go to the project folder:

	```powershell
	Set-Location C:\Users\mats\Desktop\projects\TicTacToe
	```

3. Activate the virtual environment:

	```powershell
	.\.venv\Scripts\Activate.ps1
	```

4. Install the Python dependencies:

	```powershell
	python -m pip install -r backend\requirements.txt
	```

5. Start the backend:

	```powershell
	python backend\app.py
	```

6. Open the frontend in a browser.

## Play on two devices

- Open the deployed frontend on both devices.
- On one device, join as `X`.
- On the other device, join as `O`.
- Take turns clicking the board.

The frontend points at the Render backend URL in `Client/index.html`.