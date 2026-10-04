/* ================= ATTENDANCE STATUS ================= */
let students = [];
let todayAttendance = {};
async function loadStudents() {
  try {
    const response = await fetch("/api/students");

    students = await response.json();

    displayStudents();
    displayRecords();
    displayAttendanceTable();
    updateStatistics();
  } catch (error) {
    console.error("Error loading students:", error);
  }
}
/* ================= LOGIN ================= */

document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;

    const password = document.getElementById("password").value;

    const userType = document.getElementById("userType").value;

    const message = document.getElementById("loginMessage");

    /*
           Demo login:
           username = admin
           password = 1234
        */

    if (username === "admin" && password === "1234") {
      document.getElementById("loginPage").classList.add("hidden");

      if (userType === "teacher") {
        document.getElementById("teacherDashboard").classList.remove("hidden");

        initializeTeacherDashboard();
      } else {
        document.getElementById("studentDashboard").classList.remove("hidden");
      }
    } else {
      message.textContent = "Invalid username or password.";
    }
  });

/* ================= INITIALIZE TEACHER DASHBOARD ================= */
function initializeTeacherDashboard() {
  loadStudents();

  displayCurrentDate();
}

function showSection(sectionId) {
  const sections = document.querySelectorAll(".content-section");

  sections.forEach(function (section) {
    section.classList.add("hidden");
  });

  document.getElementById(sectionId).classList.remove("hidden");

  const titles = {
    dashboardSection: "Dashboard",

    markAttendanceSection: "Mark Attendance",

    studentsSection: "Students",

    recordsSection: "Attendance Records",
  };

  document.getElementById("pageTitle").textContent = titles[sectionId];
}

/* ================= SHOW STUDENT SECTION ================= */

function showStudentSection(sectionId) {
  const sections = document.querySelectorAll(
    "#studentDashboard .content-section",
  );

  sections.forEach(function (section) {
    section.classList.add("hidden");
  });

  document.getElementById(sectionId).classList.remove("hidden");
}

/* ================= CURRENT DATE ================= */

function displayCurrentDate() {
  const date = new Date();

  const options = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  };

  document.getElementById("currentDate").textContent = date.toLocaleDateString(
    "en-IN",
    options,
  );
}

/* ================= DISPLAY ATTENDANCE TABLE ================= */

function displayAttendanceTable() {
  const table = document.getElementById("attendanceTable");

  table.innerHTML = "";

  students.forEach(function (student) {
    const row = document.createElement("tr");

    row.innerHTML = `

            <td>${student.roll}</td>

            <td>${student.name}</td>

            <td>

                <div class="attendance-buttons">

                    <button
                        class="present-button"
                        id="present-${student.roll}"
                        onclick="markStatus('${student.roll}', 'Present')">

                        ✓ Present

                    </button>


                    <button
                        class="absent-button"
                        id="absent-${student.roll}"
                        onclick="markStatus('${student.roll}', 'Absent')">

                        ✕ Absent

                    </button>

                </div>

            </td>

        `;

    table.appendChild(row);
  });
}

/* ================= MARK PRESENT / ABSENT ================= */

function markStatus(roll, status) {
  todayAttendance[roll] = status;

  const presentButton = document.getElementById(`present-${roll}`);

  const absentButton = document.getElementById(`absent-${roll}`);

  presentButton.classList.remove("selected");

  absentButton.classList.remove("selected");

  if (status === "Present") {
    presentButton.classList.add("selected");
  } else {
    absentButton.classList.add("selected");
  }
}

/* ================= SAVE ATTENDANCE ================= */

function saveAttendance() {
  let present = 0;

  let absent = 0;

  students.forEach(function (student) {
    const status = todayAttendance[student.roll];

    if (status === "Present") {
      present++;
    } else if (status === "Absent") {
      absent++;
    }
  });

  if (present + absent !== students.length) {
    alert("Please mark attendance for every student.");

    return;
  }

  document.getElementById("attendanceMessage").textContent =
    "Attendance saved successfully!";

  document.getElementById("presentToday").textContent = present;

  document.getElementById("absentToday").textContent = absent;
}

async function addStudent() {
  const roll = document.getElementById("newRoll").value.trim();
  const name = document.getElementById("newName").value.trim();

  if (roll === "" || name === "") {
    alert("Please enter roll number and student name.");
    return;
  }

  try {
    const response = await fetch("/api/students", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roll: roll,
        name: name,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.error);
      return;
    }

    alert("Student added successfully!");

    document.getElementById("newRoll").value = "";
    document.getElementById("newName").value = "";

    await loadStudents();
  } catch (error) {
    console.error("Error adding student:", error);
    alert("Could not add student.");
  }
}

/* ================= DISPLAY STUDENTS ================= */

function displayStudents() {
  const table = document.getElementById("studentsTable");

  table.innerHTML = "";

  students.forEach(function (student) {
    let statusClass = "good";

    let statusText = "Good";

    if (student.attendance < 75) {
      statusClass = "danger";

      statusText = "Low";
    } else if (student.attendance < 80) {
      statusClass = "warning";

      statusText = "Warning";
    }

    const row = document.createElement("tr");

    row.innerHTML = `

            <td>${student.roll}</td>

            <td>${student.name}</td>

            <td>${student.attendance}%</td>

            <td>

                <span class="status ${statusClass}">
                    ${statusText}
                </span>

            </td>

        `;

    table.appendChild(row);
  });

  document.getElementById("totalStudents").textContent = students.length;
}

/* ================= ADD STUDENT ================= */

function openStudentForm() {
  document.getElementById("studentForm").classList.toggle("hidden");
}

document.getElementById("newRoll").value = "";

document.getElementById("newName").value = "";

displayStudents();

displayAttendanceTable();

displayRecords();

updateStatistics();

alert("Student added successfully!");

/* ================= DISPLAY RECORDS ================= */

function displayRecords() {
  const table = document.getElementById("recordsTable");

  table.innerHTML = "";

  students.forEach(function (student) {
    const classesHeld = 20;

    const classesAttended = Math.round(
      (classesHeld * student.attendance) / 100,
    );

    let statusClass = "good";

    let statusText = "Good";

    if (student.attendance < 75) {
      statusClass = "danger";

      statusText = "Low";
    } else if (student.attendance < 80) {
      statusClass = "warning";

      statusText = "Warning";
    }

    const row = document.createElement("tr");

    row.innerHTML = `

            <td>${student.roll}</td>

            <td>${student.name}</td>

            <td>${classesHeld}</td>

            <td>${classesAttended}</td>

            <td>${student.attendance}%</td>

            <td>

                <span class="status ${statusClass}">
                    ${statusText}
                </span>

            </td>

        `;

    table.appendChild(row);
  });
}

/* ================= UPDATE STATISTICS ================= */

function updateStatistics() {
  if (students.length === 0) {
    document.getElementById("averageAttendance").textContent = "0%";

    return;
  }

  let total = 0;

  students.forEach(function (student) {
    total += student.attendance;
  });

  const average = Math.round(total / students.length);

  document.getElementById("averageAttendance").textContent = average + "%";
}

/* ================= LOGOUT ================= */

function logout() {
  document.getElementById("teacherDashboard").classList.add("hidden");

  document.getElementById("studentDashboard").classList.add("hidden");

  document.getElementById("loginPage").classList.remove("hidden");

  document.getElementById("username").value = "";

  document.getElementById("password").value = "";

  document.getElementById("loginMessage").textContent = "";
}
