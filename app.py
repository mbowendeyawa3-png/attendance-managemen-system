from flask import Flask, render_template, jsonify, request
import sqlite3

app = Flask(__name__)

DATABASE = "attendance.db"


def get_db_connection():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():

    connection = get_db_connection()

    connection.execute("""
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            roll_number TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL
        )
    """)

    # Add sample students
    sample_students = [
        ("101", "Rahul Sharma"),
        ("102", "Priya Patel"),
        ("103", "Ahmed Khan"),
        ("104", "Anjali Mehta"),
        ("105", "Rohan Singh")
    ]

    for roll_number, name in sample_students:
        try:
            connection.execute(
                "INSERT INTO students (roll_number, name) VALUES (?, ?)",
                (roll_number, name)
            )
        except sqlite3.IntegrityError:
            pass

    connection.commit()
    connection.close()

@app.route("/api/students")
def get_students():

    connection = get_db_connection()

    students = connection.execute(
        "SELECT * FROM students ORDER BY roll_number"
    ).fetchall()

    connection.close()

    student_list = []

    for student in students:
        student_list.append({
            "id": student["id"],
            "roll": student["roll_number"],
            "name": student["name"]
        })

        return jsonify(student_list)

    
@app.route("/api/students", methods=["POST"])

def add_student():

    data = request.get_json()

    roll_number = data["roll"]
    name = data["name"]

    connection = get_db_connection()

    try:
        connection.execute(
            "INSERT INTO students (roll_number, name) VALUES (?, ?)",
            (roll_number, name)
        )

        connection.commit()

    except sqlite3.IntegrityError:
        connection.close()
        return jsonify({"error": "Roll number already exists"}), 400

    connection.close()

    return jsonify({
        "message": "Student added successfully"
    }), 201

@app.route("/")
def home():
    return render_template("index.html")


if __name__ == "__main__":
    initialize_database()
    app.run(debug=True)