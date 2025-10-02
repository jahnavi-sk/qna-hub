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

    CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_image VARCHAR(255) NOT NULL,
    answer_image VARCHAR(255) NOT NULL
    );

    CREATE TABLE user_question_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        question_id INT NOT NULL,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
        INDEX idx_user_question (user_id, question_id),
        INDEX idx_completed_at (completed_at)
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



    /* changes made */

        CREATE TABLE question_answers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        question_id INT NOT NULL,
        answer_image VARCHAR(255) NOT NULL,
        answer_order INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
        INDEX idx_question_order (question_id, answer_order)
    );

    INSERT INTO question_answers (question_id, answer_image, answer_order)
    SELECT id, answer_image, 1
    FROM questions 
    WHERE answer_image IS NOT NULL AND answer_image != '';

    ALTER TABLE questions DROP COLUMN answer_image;

    ALTER TABLE userCreds 
    ADD COLUMN id INT AUTO_INCREMENT PRIMARY KEY FIRST,
    ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ADD UNIQUE KEY unique_username (username),
    ADD UNIQUE KEY unique_email (email);




    /* Actual Entire DB*/

    CREATE TABLE userCreds(
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        question_image VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE question_answers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        question_id INT NOT NULL,
        answer_image VARCHAR(255) NOT NULL,
        answer_order INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
        INDEX idx_question_order (question_id, answer_order)
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

    CREATE TABLE user_question_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        question_id INT NOT NULL,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
        INDEX idx_user_question (user_id, question_id),
        INDEX idx_completed_at (completed_at)
    );




    /* user permissions */
    ALTER TABLE userCreds ADD COLUMN role VARCHAR(20) DEFAULT 'user';

    UPDATE userCreds SET role='limited' WHERE username='u1';
    UPDATE userCreds SET role='user' WHERE username='u2';


```
