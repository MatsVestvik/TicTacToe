from flask import Flask, jsonify


app = Flask(__name__)
count = 0


@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    return response


@app.get('/api/counter')
def get_counter():
    return jsonify(count=count)


@app.post('/api/counter/increment')
def increment_counter():
    global count
    count += 1
    return jsonify(count=count, message='Counter incremented in Python')


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)