from flask import Flask, render_template, request, redirect, url_for, jsonify
import sqlite3

app = Flask(__name__)

# Initialize SQLite database
def init_db():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE
        )
    ''')
    conn.commit()
    conn.close()

# Route for homepage (serving static pages)
@app.route('/')
def index():
    return render_template('index.html')

# API to create a user
@app.route('/users', methods=['POST'])
def create_user():
    data = request.get_json()
    name = data['name']
    email = data['email']

    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO users (name, email)
        VALUES (?, ?)
    ''', (name, email))
    conn.commit()
    conn.close()

    return jsonify({'message': 'User created successfully!'}), 201

# API to fetch all users
@app.route('/users', methods=['GET'])
def get_users():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users')
    users = cursor.fetchall()
    conn.close()

    return jsonify({'users': users})

# Route to serve an HTML template (like a form for adding a user)
@app.route('/add-user', methods=['GET', 'POST'])
def add_user():
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        conn = sqlite3.connect('database.db')
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO users (name, email)
            VALUES (?, ?)
        ''', (name, email))
        conn.commit()
        conn.close()
        return redirect(url_for('index'))

    return render_template('add_user.html')

# Initialize the database when the app starts
init_db()

if __name__ == '__main__':
    app.run(debug=True)
