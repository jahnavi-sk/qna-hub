from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import bcrypt
import os
import time
from datetime import datetime

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
    question_file = request.files.get('question')
    if not question_file:
        return jsonify({'error': 'Question file is required'}), 400

    tags = request.form.getlist('tags[]')
    
    # Get multiple answer files - check all possible answer_N keys
    answer_files = []
    for i in range(5):  # Check for answer_0, answer_1, etc.
        answer_key = f'answer_{i}'
        if answer_key in request.files:
            answer_files.append(request.files[answer_key])
    
    # Also check for 'answer' key for backward compatibility
    if 'answer' in request.files:
        # If it's a single file, add it
        answer_file = request.files['answer']
        if answer_file:
            answer_files.append(answer_file)
    
    if not answer_files:
        return jsonify({'error': 'At least one answer file is required'}), 400

    # Save question image
    q_filename = os.path.join('static/questions', unique_filename(question_file.filename))
    os.makedirs(os.path.dirname(q_filename), exist_ok=True)
    question_file.save(q_filename)

    # Insert question
    cursor.execute(
        "INSERT INTO questions (question_image) VALUES (%s)",
        (q_filename,)
    )
    db.commit()
    question_id = cursor.lastrowid

    # Save and insert answer images
    for i, answer_file in enumerate(answer_files):
        if answer_file and answer_file.filename:
            a_filename = os.path.join('static/answers', unique_filename(answer_file.filename))
            os.makedirs(os.path.dirname(a_filename), exist_ok=True)
            answer_file.save(a_filename)
            
            cursor.execute(
                "INSERT INTO question_answers (question_id, answer_image, answer_order) VALUES (%s, %s, %s)",
                (question_id, a_filename, i + 1)
            )
            db.commit()

    # Insert tags (existing code)
    for tag in tags:
        cursor.execute("INSERT IGNORE INTO tags (name) VALUES (%s)", (tag,))
        db.commit()
        cursor.execute("SELECT id FROM tags WHERE name=%s", (tag,))
        tag_id = cursor.fetchone()['id']
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
    unsolved_only = request.args.get('unsolved_only', 'false').lower() == 'true'
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

        # For logical AND, we need questions that have ALL the specified tags
        placeholders = ','.join(['%s'] * len(tags))
        
        if unsolved_only:
            query = f"""
                SELECT 
                    q.id, 
                    q.question_image,
                    MAX(uqh.completed_at) as last_solved_at,
                    'Never solved' as last_solved_text
                FROM questions q
                JOIN question_tags qt ON q.id = qt.question_id
                JOIN tags t ON qt.tag_id = t.id
                LEFT JOIN user_question_history uqh ON q.id = uqh.question_id AND uqh.user_id = %s
                WHERE t.name IN ({placeholders})
                GROUP BY q.id, q.question_image
                HAVING COUNT(DISTINCT t.name) = %s AND MAX(uqh.completed_at) IS NULL
                ORDER BY q.id DESC
                LIMIT %s
            """
            cursor.execute(query, (user_id, *tags, len(tags), limit))
        else:
            query = f"""
                SELECT 
                    q.id, 
                    q.question_image,
                    MAX(uqh.completed_at) as last_solved_at,
                    CASE 
                        WHEN MAX(uqh.completed_at) IS NULL THEN 'Never solved'
                        ELSE CONCAT(
                            TIMESTAMPDIFF(DAY, MAX(uqh.completed_at), NOW()), 
                            ' days ago'
                        )
                    END as last_solved_text
                FROM questions q
                JOIN question_tags qt ON q.id = qt.question_id
                JOIN tags t ON qt.tag_id = t.id
                LEFT JOIN user_question_history uqh ON q.id = uqh.question_id AND uqh.user_id = %s
                WHERE t.name IN ({placeholders})
                GROUP BY q.id, q.question_image
                HAVING COUNT(DISTINCT t.name) = %s
                ORDER BY q.id DESC
                LIMIT %s
            """
            cursor.execute(query, (user_id, *tags, len(tags), limit))
    else:
        if unsolved_only:
            query = """
                SELECT 
                    q.id, 
                    q.question_image,
                    MAX(uqh.completed_at) as last_solved_at,
                    'Never solved' as last_solved_text
                FROM questions q
                LEFT JOIN user_question_history uqh ON q.id = uqh.question_id AND uqh.user_id = %s
                GROUP BY q.id, q.question_image
                HAVING MAX(uqh.completed_at) IS NULL
                ORDER BY q.id DESC
                LIMIT %s
            """
            cursor.execute(query, (user_id, limit))
        else:
            query = """
                SELECT 
                    q.id, 
                    q.question_image,
                    MAX(uqh.completed_at) as last_solved_at,
                    CASE 
                        WHEN MAX(uqh.completed_at) IS NULL THEN 'Never solved'
                        ELSE CONCAT(
                            TIMESTAMPDIFF(DAY, MAX(uqh.completed_at), NOW()), 
                            ' days ago'
                        )
                    END as last_solved_text
                FROM questions q
                LEFT JOIN user_question_history uqh ON q.id = uqh.question_id AND uqh.user_id = %s
                GROUP BY q.id, q.question_image
                ORDER BY q.id DESC
                LIMIT %s
            """
            cursor.execute(query, (user_id, limit))

    questions = cursor.fetchall()
    cursor.close()
    db.close()

    for q in questions:
        q['question_image'] = '/' + q['question_image'] if not q['question_image'].startswith('/') else q['question_image']
        
        # Handle the case where last_solved_at might be 0 days
        if q['last_solved_at'] is not None:
            days_diff = (datetime.now() - q['last_solved_at']).days
            if days_diff == 0:
                q['last_solved_text'] = 'Today'
            elif days_diff == 1:
                q['last_solved_text'] = '1 day ago'
            else:
                q['last_solved_text'] = f'{days_diff} days ago'
        else:
            q['last_solved_text'] = 'Never solved'
    
    return jsonify(questions)

@app.route('/api/questions/<int:question_id>/complete', methods=['POST'])
def mark_question_complete(question_id):
    data = request.get_json()
    user_id = data.get('user_id', 'default_user')
    
    # Create a new connection for this request
    db = mysql.connector.connect(
        host="localhost",
        user=DB_USER,
        password=DB_PASSWORD,
        database="qnahub"
    )
    cursor = db.cursor(dictionary=True)
    
    try:
        # Insert or update the user_question_history table
        cursor.execute("""
            INSERT INTO user_question_history (user_id, question_id, completed_at)
            VALUES (%s, %s, NOW())
            ON DUPLICATE KEY UPDATE completed_at = NOW()
        """, (user_id, question_id))
        
        db.commit()
        cursor.close()
        db.close()
        
        return jsonify({"message": "Question marked as completed", "success": True})
    except Exception as e:
        cursor.close()
        db.close()
        return jsonify({"error": str(e)}), 500  

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
        password=DB_PASSWORD,
        database="qnahub"
    )
    cursor = db.cursor(dictionary=True)

    placeholders = ','.join(['%s'] * len(ids))
    query = f"""
        SELECT q.id, q.question_image, qa.answer_image, qa.answer_order
        FROM questions q
        LEFT JOIN question_answers qa ON q.id = qa.question_id
        WHERE q.id IN ({placeholders})
        ORDER BY q.id, qa.answer_order
    """
    cursor.execute(query, tuple(ids))
    results = cursor.fetchall()
    cursor.close()
    db.close()
    # for q in questions:
    #     q['question_image'] = '/' + q['question_image'] if not q['question_image'].startswith('/') else q['question_image']
    #     q['answer_image'] = '/' + q['answer_image'] if not q['answer_image'].startswith('/') else q['answer_image']
    # return jsonify(questions)
    questions = {}
    for row in results:
        q_id = row['id']
        if q_id not in questions:
            questions[q_id] = {
                'id': q_id,
                'question_image': '/' + row['question_image'] if not row['question_image'].startswith('/') else row['question_image'],
                'answer_images': []
            }
        
        if row['answer_image']:
            answer_path = '/' + row['answer_image'] if not row['answer_image'].startswith('/') else row['answer_image']
            questions[q_id]['answer_images'].append(answer_path)
    
    return jsonify(list(questions.values()))


@app.route('/api/questions/completed', methods=['GET'])
def get_completed_questions():
    user_id = request.args.get('user_id', 'default_user')
    limit = 50

    # Create a new connection for this request
    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password=DB_PASSWORD,
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