# Backend Counter Demo

This is a tiny example of a frontend button talking to a Python backend.

## Files

- `Client/` contains the HTML, CSS, and JavaScript.
- `backend/` contains the Flask app and the counter state.

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

Clicking the button sends a request to Python, Python increments the counter, and the label updates with the new value.