# Backend Counter Demo

This is a tiny example of buttons talking to a Python backend.

## Deploying the backend to Vercel

Vercel can host the Flask app in [backend/app.py](backend/app.py) as a Python function.
This repo now includes [pyproject.toml](pyproject.toml), which points Vercel at `backend.app:app`.

When you deploy the backend, Vercel will give it a public URL like `https://your-backend.vercel.app`.
Set `window.API_BASE_URL` in the frontend to that URL so the browser stops calling `localhost`.

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

Clicking `+` calls `/api/counter/increase` and clicking `-` calls `/api/counter/decrease`. Python updates the count and the label changes.

If you deploy the frontend separately on Vercel, make sure it knows the backend URL through `window.API_BASE_URL`.