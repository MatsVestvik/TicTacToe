# Backend Counter Demo

This is a tiny example of buttons talking to a Python backend.

## How it works

- The browser loads `Client/index.html`.
- `Client/main.js` builds the tiny UI and calls the backend with `fetch()`.
- `backend/app.py` stores the count and answers with JSON.

## Run

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

6. Leave that terminal open while the backend is running.
7. Open `Client/index.html` in your browser.

Clicking `+` sends `{"delta": 1}` and clicking `-` sends `{"delta": -1}`. Python updates the count and the label changes.