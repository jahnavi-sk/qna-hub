from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import bcrypt

app = Flask(__name__)
CORS(app)

# Configure MySQL connection
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="password",
    database="qnahub"
)
cursor = db.cursor(dictionary=True)

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'error': 'Missing fields'}), 400

    cursor.execute("SELECT * FROM userCreds WHERE username=%s OR email=%s", (username, email))
    user = cursor.fetchone()
    if user:
        return jsonify({'error': 'User already exists'}), 409

    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    cursor.execute("INSERT INTO userCreds (username, email, password) VALUES (%s, %s, %s)", (username, email, hashed.decode('utf-8')))
    db.commit()
    return jsonify({'success': True}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Missing fields'}), 400

    cursor.execute("SELECT password FROM userCreds WHERE username=%s", (username,))
    user = cursor.fetchone()
    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401

    hashed = user['password'].encode('utf-8')
    if bcrypt.checkpw(password.encode('utf-8'), hashed):
        return jsonify({'success': True, 'username': username}), 200
    else:
        return jsonify({'error': 'Invalid credentials'}), 401

if __name__ == '__main__':
    app.run(debug=True)