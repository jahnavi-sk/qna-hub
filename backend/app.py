from flask import Flask, request, jsonify


app = Flask(__name__)


@app.route("/", methods=["GET"])
def home():
    return "Welcome to my Flask Backend!"


@app.route("/home", methods=["GET"])
def home_route():
    return jsonify({"message": "Welcome to my Flask Backend!"})

if __name__ == "__main__":
    app.run(debug=True)