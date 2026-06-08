from flask import Flask, jsonify, request


# Flask is the small Python web server.
app = Flask(__name__)

# This value lives on the server, not in the browser.
count = 0


@app.after_request
def add_cors_headers(response):
    # Live Server runs the frontend from a different address,
    # so we allow the browser to call this API.
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response


@app.route('/api/counter', methods=['GET', 'POST'])
def counter():
    global count

    # GET means "show me the current value".
    if request.method == 'GET':
        return jsonify(count=count)

    # POST means "change the value".
    count += 1
    return jsonify(count=count, message='Counter incremented in Python')


if __name__ == '__main__':
    # Start the server on your laptop.
    app.run(host='127.0.0.1', port=5000, debug=True)