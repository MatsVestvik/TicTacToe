# Backend Counter Demo

This is a tiny example of a frontend button talking to a Python backend.

## Files

- `Client/` contains the HTML, CSS, and JavaScript.
- `backend/` contains the Flask app and the counter state.

## Run

1. Install Python dependencies: `pip install -r backend/requirements.txt`
2. Start the backend: `python backend/app.py`
3. Open `Client/index.html` in a browser

Clicking the button sends a request to Python, Python increments the counter, and the label updates with the new value.