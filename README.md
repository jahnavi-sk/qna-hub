#### Frontend 


##### To install
```
npm i
```

##### To run
```
npm run dev
```


#### Backend
```
python3 -m venv venv
```

```
    pip install flask mysql-connector-python flask flask-cors bcrypt
```

- running it:

```
    python3 app.py
```

##### SQL

```sql
    create table userCreds(
    username VARCHAR(255),
    email VARCHAR(255),
    password VARCHAR(255));

    CREATE TABLE user_question_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        question_id INT NOT NULL,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
        INDEX idx_user_question (user_id, question_id),
        INDEX idx_completed_at (completed_at)
    );

    CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_image VARCHAR(255) NOT NULL,
    answer_image VARCHAR(255) NOT NULL
    );

    CREATE TABLE tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
    );

    CREATE TABLE question_tags (
    question_id INT,
    tag_id INT,
    PRIMARY KEY (question_id, tag_id),
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );

```
