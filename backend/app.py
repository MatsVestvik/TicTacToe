from flask import Flask, jsonify, request


# Import the Flask tools we need:
# - Flask creates the web app
# - jsonify turns Python data into JSON for the browser
# - request tells us which HTTP method the browser used
app = Flask(__name__)

# This number lives in Python memory on the server.
# Every browser request reads or changes this same value.
count = 0


@app.after_request
def add_cors_headers(response):
    # This runs after every response.
    # It adds CORS headers so the browser can call Flask
    # even when the HTML is opened from a different origin.
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response


@app.route('/api/counter', methods=['GET', 'POST'])
def counter():
    # We are going to update the global counter variable,
    # so Python needs to know we mean the outer variable.
    global count

    # GET means "read the current value".
    if request.method == 'GET':
        # jsonify(count=count) makes this response look like:
        # { "count": 0 }
        return jsonify(count=count)

    # POST means "change the value".
    # The browser sends JSON like {"delta": 1} or {"delta": -1}.
    data = request.get_json(silent=True) or {}
    delta = data.get('delta', 1)

    # Convert the incoming value to an integer and ignore bad input.
    try:
        delta = int(delta)
    except (TypeError, ValueError):
        delta = 0

    count += delta

    if delta >= 0:
        message = 'Counter increased in Python'
    else:
        message = 'Counter decreased in Python'

    return jsonify(count=count, message=message)


if __name__ == '__main__':
    # Start the development server on your laptop.
    # host='127.0.0.1' means "only this computer can reach it".
    # port=5000 is the address the browser uses.
    app.run(host='127.0.0.1', port=5000, debug=True)