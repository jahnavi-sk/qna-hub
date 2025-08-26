from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import bcrypt
import os
import time

app = Flask(__name__)
# CORS(app)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

DB_PASSWORD = "hi"  
DB_USER = "root"
def unique_filename(filename):
    name, ext = os.path.splitext(filename)
    timestamp = int(time.time() * 1000)
    return f"{name}_{timestamp}{ext}"

# Configure MySQL connection
db = mysql.connector.connect(
    host="localhost",
    user=DB_USER,
    password=DB_PASSWORD,
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

@app.route('/api/admin/upload', methods=['POST'])
def upload_question():
    # Get files and tags from the request
    question_file = request.files['question']
    answer_file = request.files['answer']
    tags = request.form.getlist('tags[]')  # tags[]: ["math", "science"]



    # Save images to disk (e.g., static/questions/)
    # q_filename = os.path.join('static/questions', question_file.filename)
    # a_filename = os.path.join('static/answers', answer_file.filename)


    q_filename = os.path.join('static/questions', unique_filename(question_file.filename))
    a_filename = os.path.join('static/answers', unique_filename(answer_file.filename))
    os.makedirs(os.path.dirname(q_filename), exist_ok=True)
    os.makedirs(os.path.dirname(a_filename), exist_ok=True)

    question_file.save(q_filename)
    answer_file.save(a_filename)

    
    # Insert question
    cursor.execute(
        "INSERT INTO questions (question_image, answer_image) VALUES (%s, %s)",
        (q_filename, a_filename)
    )
    db.commit()
    question_id = cursor.lastrowid

    # Insert tags and question_tags
    for tag in tags:
        # Insert tag if not exists
        cursor.execute("INSERT IGNORE INTO tags (name) VALUES (%s)", (tag,))
        db.commit()
        cursor.execute("SELECT id FROM tags WHERE name=%s", (tag,))
        tag_id = cursor.fetchone()['id']
        # Link question and tag
        cursor.execute(
            "INSERT INTO question_tags (question_id, tag_id) VALUES (%s, %s)",
            (question_id, tag_id)
        )
        db.commit()

    return jsonify({'success': True}), 201

# @app.route('/api/questions', methods=['GET'])
# def get_questions():
#     cursor.execute("""
#         SELECT q.id, q.question_image, GROUP_CONCAT(t.name) as tags
#         FROM questions q
#         LEFT JOIN question_tags qt ON q.id = qt.question_id
#         LEFT JOIN tags t ON qt.tag_id = t.id
#         GROUP BY q.id
#     """)
#     questions = cursor.fetchall()
#     # Optionally, adjust the image path to be a URL
#     for q in questions:
#         # Remove 'static/' so the URL is correct for Flask static serving
#         q['question_image'] = '/' + q['question_image'] if not q['question_image'].startswith('/') else q['question_image']
#     return jsonify(questions)



# @app.route('/api/questions', methods=['GET'])
# def get_questions():
#     tags_param = request.args.get('tags')
#     limit = 50  # max 2 carousels * 25

#     if tags_param:
#         tags = [t.strip() for t in tags_param.split(',') if t.strip()]
#         if not tags:
#             return jsonify([])

#         placeholders = ','.join(['%s'] * len(tags))
#         print("placeholders = " + placeholders)
#         query = f"""
#             SELECT DISTINCT q.id, q.question_image
#             FROM questions q
#             JOIN question_tags qt ON q.id = qt.question_id
#             JOIN tags t ON qt.tag_id = t.id
#             WHERE t.name IN ({placeholders})
#             ORDER BY q.id DESC
#             LIMIT %s
#         """
#         print("query = " + query)
#         cursor.execute(query, (*tags, limit))
#         questions = cursor.fetchall()
#     else:
#         cursor.execute("""
#             SELECT id, question_image
#             FROM questions
#             ORDER BY id DESC
#             LIMIT %s
#         """, (limit,))
#         questions = cursor.fetchall()

#     for q in questions:
#         q['question_image'] = '/' + q['question_image'] if not q['question_image'].startswith('/') else q['question_image']
#     return jsonify(questions)


@app.route('/api/questions', methods=['GET'])
def get_questions():
    tags_param = request.args.get('tags')
    user_id = request.args.get('user_id', 'default_user')
    limit = 50

    # Create a new connection for this request
    db = mysql.connector.connect(
        host="localhost",
        user=DB_USER,
        password=DB_PASSWORD,
        database="qnahub"
    )
    cursor = db.cursor(dictionary=True)

    if tags_param:
        tags = [t.strip() for t in tags_param.split(',') if t.strip()]
        if not tags:
            cursor.close()
            db.close()
            return jsonify([])

        placeholders = ','.join(['%s'] * len(tags))
        query = f"""
            SELECT DISTINCT q.id, q.question_image
            FROM questions q
            JOIN question_tags qt ON q.id = qt.question_id
            JOIN tags t ON qt.tag_id = t.id
            LEFT JOIN user_question_history uqh ON q.id = uqh.question_id 
                AND uqh.user_id = %s 
                AND uqh.completed_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
            WHERE t.name IN ({placeholders})
                AND uqh.id IS NULL
            ORDER BY q.id DESC
            LIMIT %s
        """
        cursor.execute(query, (user_id, *tags, limit))
    else:
        query = """
            SELECT DISTINCT q.id, q.question_image
            FROM questions q
            LEFT JOIN user_question_history uqh ON q.id = uqh.question_id 
                AND uqh.user_id = %s 
                AND uqh.completed_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
            WHERE uqh.id IS NULL
            ORDER BY q.id DESC
            LIMIT %s
        """
        cursor.execute(query, (user_id, limit))

    questions = cursor.fetchall()
    cursor.close()
    db.close()

    for q in questions:
        q['question_image'] = '/' + q['question_image'] if not q['question_image'].startswith('/') else q['question_image']
    return jsonify(questions)

@app.route('/api/questions/<int:question_id>/complete', methods=['POST'])
def mark_question_complete(question_id):
    user_id = request.json.get('user_id', 'default_user')
    
    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password="hi",
        database="qnahub"
    )
    cursor = db.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            INSERT INTO user_question_history (user_id, question_id)
            VALUES (%s, %s)
        """, (user_id, question_id))
        db.commit()
        cursor.close()
        db.close()
        return jsonify({'success': True})
    except Exception as e:
        cursor.close()
        db.close()
        return jsonify({'error': str(e)}), 500
    

@app.route('/api/questions_by_ids', methods=['GET'])
def get_questions_by_ids():
    ids_param = request.args.get('ids')
    if not ids_param:
        return jsonify([])
    try:
        ids = [int(i) for i in ids_param.split(',') if i.strip().isdigit()]
    except Exception:
        return jsonify({'error': 'Invalid ids'}), 400
    if not ids:
        return jsonify([])

    # Create a new connection and cursor for this request
    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password="hi",
        database="qnahub"
    )
    cursor = db.cursor(dictionary=True)

    placeholders = ','.join(['%s'] * len(ids))
    query = f"""
        SELECT id, question_image, answer_image
        FROM questions
        WHERE id IN ({placeholders})
    """
    cursor.execute(query, tuple(ids))
    questions = cursor.fetchall()
    cursor.close()
    db.close()
    for q in questions:
        q['question_image'] = '/' + q['question_image'] if not q['question_image'].startswith('/') else q['question_image']
        q['answer_image'] = '/' + q['answer_image'] if not q['answer_image'].startswith('/') else q['answer_image']
    return jsonify(questions)


@app.route('/api/questions/completed', methods=['GET'])
def get_completed_questions():
    user_id = request.args.get('user_id', 'default_user')
    limit = 50

    # Create a new connection for this request
    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password="hi",
        database="qnahub"
    )
    cursor = db.cursor(dictionary=True)

    query = """
        SELECT q.id, q.question_image, uqh.completed_at
        FROM questions q
        JOIN user_question_history uqh ON q.id = uqh.question_id
        WHERE uqh.user_id = %s 
            AND uqh.completed_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
        ORDER BY uqh.completed_at DESC
        LIMIT %s
    """
    cursor.execute(query, (user_id, limit))
    questions = cursor.fetchall()
    cursor.close()
    db.close()

    for q in questions:
        q['question_image'] = '/' + q['question_image'] if not q['question_image'].startswith('/') else q['question_image']
    return jsonify(questions)


if __name__ == '__main__':
    app.run(debug=True)