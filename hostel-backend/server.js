const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const db = require("./db");

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ================= MULTER CONFIG ================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "uploads")),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `profile_${req.params.userId}_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error("Only image files are allowed"));
  },
});

/* ================= HOME ================= */
app.get("/", (req, res) => {
  res.send("Hostel Management Backend is running");
});

/* ================= LOGIN ================= */
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  db.query(
    `
    SELECT user_id, name, email, role
    FROM user
    WHERE email = ? AND password = ?
    `,
    [email, password],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (results.length === 0)
        return res.status(401).json({ message: "Invalid email or password" });

      res.json({ message: "Login successful", user: results[0] });
    }
  );
});

/* ================= STUDENT PROFILE ================= */
app.get("/student/:userId", (req, res) => {
  db.query(
    `
    SELECT s.student_id, u.name, s.roll_no, s.course, s.year, s.gender, s.phone,
           s.profile_picture, s.profile_picture_changed
    FROM student s
    JOIN user u ON s.user_id = u.user_id
    WHERE s.user_id = ?
    `,
    [req.params.userId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (results.length === 0)
        return res.status(404).json({ message: "Student not found" });

      res.json(results[0]);
    }
  );
});

/* ================= UPDATE STUDENT NAME ================= */
app.put("/student/:userId", (req, res) => {
  const { name } = req.body;
  const userId = req.params.userId;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Name is required" });
  }

  db.query(
    "UPDATE user SET name = ? WHERE user_id = ?",
    [name.trim(), userId],
    (err) => {
      if (err) return res.status(500).json({ message: "Failed to update name" });
      res.json({ message: "Name updated successfully" });
    }
  );
});

/* ================= STUDENT PROFILE PICTURE (ONE-TIME) ================= */
app.post("/student/profile-picture/:userId", upload.single("profile_pic"), (req, res) => {
  const userId = req.params.userId;
  if (!req.file) return res.status(400).json({ message: "No image file provided" });

  // Check if already changed
  db.query(
    "SELECT profile_picture_changed FROM student WHERE user_id = ?",
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (rows.length === 0) return res.status(404).json({ message: "Student not found" });
      if (rows[0].profile_picture_changed === 1) {
        return res.status(403).json({ message: "Profile picture can only be changed once" });
      }

      const picturePath = `/uploads/${req.file.filename}`;
      db.query(
        "UPDATE student SET profile_picture = ?, profile_picture_changed = 1 WHERE user_id = ?",
        [picturePath, userId],
        (err) => {
          if (err) return res.status(500).json({ message: "Failed to update profile picture" });
          res.json({ message: "Profile picture updated successfully", profile_picture: picturePath });
        }
      );
    }
  );
});

/* ================= STUDENT ONBOARDING ================= */
app.put("/student/onboard/:userId", (req, res) => {
  const { gender, year, course, phone } = req.body;
  const userId = req.params.userId;

  if (!gender || !year || !course) {
    return res.status(400).json({ message: "Gender, year, and course are required" });
  }

  // Validate: senior boys have no hostel
  if (gender === "Male" && Number(year) > 1) {
    return res.status(400).json({ message: "Only 1st year boys have hostel facility" });
  }

  db.query(
    "UPDATE student SET gender = ?, year = ?, course = ?, phone = ? WHERE user_id = ?",
    [gender, year, course, phone || null, userId],
    (err) => {
      if (err) return res.status(500).json({ message: "Failed to save profile" });
      res.json({ message: "Profile completed successfully" });
    }
  );
});

/* ================= HOSTELS LIST ================= */
app.get("/hostels", (req, res) => {
  db.query(
    "SELECT hostel_id, hostel_name, hostel_type, for_year FROM hostel ORDER BY hostel_type, for_year",
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json(results);
    }
  );
});

/* ================= WARDEN PROFILE ================= */
app.get("/warden/profile/:userId", (req, res) => {
  db.query(
    `
    SELECT w.warden_id, w.hostel_id, h.hostel_name, h.hostel_type, h.for_year
    FROM warden w
    JOIN hostel h ON w.hostel_id = h.hostel_id
    WHERE w.user_id = ?
    `,
    [req.params.userId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (results.length === 0)
        return res.status(404).json({ message: "Warden not assigned to any hostel" });
      res.json(results[0]);
    }
  );
});

/* ================= ADMIN: MANAGE WARDENS ================= */
app.get("/admin/wardens", (req, res) => {
  db.query(
    `
    SELECT w.warden_id, w.user_id, u.name, u.email, w.hostel_id,
           h.hostel_name, h.hostel_type, h.for_year
    FROM warden w
    JOIN user u ON w.user_id = u.user_id
    JOIN hostel h ON w.hostel_id = h.hostel_id
    ORDER BY h.hostel_type, h.for_year
    `,
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json(results);
    }
  );
});

app.post("/admin/warden", (req, res) => {
  const { email, name, hostel_id } = req.body;
  if (!email || !hostel_id)
    return res.status(400).json({ message: "Email and hostel are required" });

  // Check if hostel already has a warden
  db.query(
    "SELECT * FROM warden WHERE hostel_id = ?",
    [hostel_id],
    (err, existing) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (existing.length > 0)
        return res.status(400).json({ message: "This hostel already has a warden assigned" });

      // Check if user exists, otherwise create
      db.query("SELECT * FROM user WHERE email = ?", [email], (err, users) => {
        if (err) return res.status(500).json({ message: "Database error" });

        if (users.length > 0) {
          const user = users[0];
          // Update role to WARDEN
          db.query("UPDATE user SET role = 'WARDEN' WHERE user_id = ?", [user.user_id], (err) => {
            if (err) return res.status(500).json({ message: "Database error" });
            // Insert into warden table
            db.query(
              "INSERT INTO warden (user_id, hostel_id) VALUES (?, ?)",
              [user.user_id, hostel_id],
              (err) => {
                if (err) return res.status(500).json({ message: "Failed to assign warden" });
                res.json({ message: "Warden assigned successfully" });
              }
            );
          });
        } else {
          // Create new user with WARDEN role
          db.query(
            "INSERT INTO user (name, email, role) VALUES (?, ?, 'WARDEN')",
            [name || email.split('@')[0], email],
            (err, result) => {
              if (err) return res.status(500).json({ message: "Failed to create warden user" });
              db.query(
                "INSERT INTO warden (user_id, hostel_id) VALUES (?, ?)",
                [result.insertId, hostel_id],
                (err) => {
                  if (err) return res.status(500).json({ message: "Failed to assign warden" });
                  res.json({ message: "Warden created and assigned successfully" });
                }
              );
            }
          );
        }
      });
    }
  );
});

app.delete("/admin/warden/:wardenId", (req, res) => {
  db.query(
    "SELECT user_id FROM warden WHERE warden_id = ?",
    [req.params.wardenId],
    (err, rows) => {
      if (err) return res.status(500).json({ message: "Database error" });

      db.query("DELETE FROM warden WHERE warden_id = ?", [req.params.wardenId], (err) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ message: "Warden removed" });
      });
    }
  );
});

/* ================= ROOM ALLOCATION (VIEW) ================= */
app.get("/allocation/student/:studentId", (req, res) => {
  db.query(
    `
    SELECT a.allocation_date, r.room_number, r.capacity, h.hostel_name
    FROM allocation a
    JOIN room r ON a.room_id = r.room_id
    JOIN hostel h ON r.hostel_id = h.hostel_id
    WHERE a.student_id = ?
    `,
    [req.params.studentId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json(results);
    }
  );
});

/* ================= ROOMMATES ================= */
app.get("/roommates/:studentId", (req, res) => {
  // First find the room_id for this student
  db.query(
    "SELECT room_id FROM allocation WHERE student_id = ?",
    [req.params.studentId],
    (err, alloc) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (alloc.length === 0) return res.json([]);

      const roomId = alloc[0].room_id;

      // Find all other students in the same room
      db.query(
        `
        SELECT u.name, s.course, s.roll_no, s.profile_picture
        FROM allocation a
        JOIN student s ON a.student_id = s.student_id
        JOIN user u ON s.user_id = u.user_id
        WHERE a.room_id = ? AND a.student_id != ?
        `,
        [roomId, req.params.studentId],
        (err, results) => {
          if (err) return res.status(500).json({ message: "Database error" });
          res.json(results);
        }
      );
    }
  );
});

/* ================= ROOM ALLOCATION (SAFE) ================= */
app.post("/allocate", (req, res) => {
  const { student_id, room_id } = req.body;
  if (!student_id || !room_id)
    return res.status(400).json({ message: "Student and Room required" });

  db.query(
    "SELECT * FROM allocation WHERE student_id = ?",
    [student_id],
    (err, existing) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (existing.length > 0)
        return res.status(400).json({ message: "Student already allocated" });

      db.query(
        "SELECT year, gender FROM student WHERE student_id = ?",
        [student_id],
        (err, s) => {
          if (err || s.length === 0)
            return res.status(404).json({ message: "Student not found" });

          const { year, gender } = s[0];

          db.query(
            `
            SELECT r.capacity, r.occupied_count, h.hostel_type
            FROM room r
            JOIN hostel h ON r.hostel_id = h.hostel_id
            WHERE r.room_id = ?
            `,
            [room_id],
            (err, r) => {
              if (err || r.length === 0)
                return res.status(404).json({ message: "Room not found" });

              const { capacity, occupied_count, hostel_type } = r[0];

              if (occupied_count >= capacity)
                return res.status(400).json({ message: "Room is full" });

              if (gender === "Male" && (hostel_type !== "Boys" || year !== 1))
                return res
                  .status(400)
                  .json({ message: "Only 1st year boys allowed" });

              if (gender === "Female") {
                if (year === 1 && capacity !== 4)
                  return res
                    .status(400)
                    .json({ message: "1st year girls need 4 sharing" });
                if (year > 1 && capacity !== 2)
                  return res
                    .status(400)
                    .json({ message: "Senior girls need 2 sharing" });
              }

              db.query(
                "INSERT INTO allocation (student_id, room_id, allocation_date) VALUES (?, ?, CURDATE())",
                [student_id, room_id],
                () => {
                  db.query(
                    "UPDATE room SET occupied_count = occupied_count + 1 WHERE room_id = ?",
                    [room_id]
                  );
                  res.json({ message: "Room allocated successfully" });
                }
              );
            }
          );
        }
      );
    }
  );
});

/* ================= COMPLAINTS ================= */
app.post("/complaint", (req, res) => {
  const { student_id, category, description } = req.body;
  if (!student_id || !category || !description)
    return res.status(400).json({ message: "All fields required" });

  db.query(
    `
    INSERT INTO complaint (student_id, category, description, status, created_date)
    VALUES (?, ?, ?, 'Open', CURDATE())
    `,
    [student_id, category, description],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json({ message: "Complaint submitted", complaint_id: result.insertId });
    }
  );
});

// Get complaints for a specific student
app.get("/complaints/student/:student_id", (req, res) => {
  const { student_id } = req.params;
  db.query(
    `SELECT * FROM complaint WHERE student_id = ? ORDER BY created_date DESC`,
    [student_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json(results);
    }
  );
});

// Update complaint status
app.put("/complaint/:complaint_id", (req, res) => {
  const { complaint_id } = req.params;
  const { status } = req.body;
  if (!status) return res.status(400).json({ message: "Status is required" });

  db.query(
    `UPDATE complaint SET status = ? WHERE complaint_id = ?`,
    [status, complaint_id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (result.affectedRows === 0) return res.status(404).json({ message: "Complaint not found" });
      res.json({ message: "Complaint status updated" });
    }
  );
});

/* ================= WARDEN: COMPLAINTS (filtered by hostel) ================= */
app.get("/complaints", (req, res) => {
  const { gender, year } = req.query;

  let query = `
    SELECT c.*, s.roll_no, s.course, s.gender, s.year, u.name
    FROM complaint c
    JOIN student s ON c.student_id = s.student_id
    JOIN user u ON s.user_id = u.user_id
  `;
  const params = [];

  if (gender && year) {
    query += " WHERE s.gender = ? AND s.year = ?";
    params.push(gender, year);
  }

  query += " ORDER BY c.created_date DESC";

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results);
  });
});

/* ================= ANNOUNCEMENTS ================= */
app.post("/announcement", (req, res) => {
  const { title, description, posted_by, hostel_id } = req.body;
  if (!title || !description || !posted_by)
    return res.status(400).json({ message: "All fields required" });

  db.query(
    "INSERT INTO announcement (title, description, posted_by, hostel_id) VALUES (?, ?, ?, ?)",
    [title, description, posted_by, hostel_id || null],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json({ message: "Announcement posted", announcement_id: result.insertId });
    }
  );
});

app.get("/announcements", (req, res) => {
  const { hostel_id } = req.query;

  let query = `
    SELECT a.announcement_id, a.title, a.description, a.created_at, a.hostel_id,
           u.name AS posted_by_name, u.role AS posted_by_role,
           h.hostel_name
    FROM announcement a
    JOIN user u ON a.posted_by = u.user_id
    LEFT JOIN hostel h ON a.hostel_id = h.hostel_id
  `;
  const params = [];

  if (hostel_id) {
    // Student view: show broadcasts (hostel_id IS NULL) + their hostel's announcements
    query += " WHERE (a.hostel_id IS NULL OR a.hostel_id = ?)";
    params.push(hostel_id);
  }

  query += " ORDER BY a.created_at DESC LIMIT 20";

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results);
  });
});

/* ================= DELETE ANNOUNCEMENT ================= */
app.delete("/announcement/:id", (req, res) => {
  db.query(
    "DELETE FROM announcement WHERE announcement_id = ?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json({ message: "Announcement deleted" });
    }
  );
});

/* ================= WARDEN: STUDENTS (filtered by hostel) ================= */
app.get("/warden/students", (req, res) => {
  const { gender, year } = req.query;

  let query = `
    SELECT DISTINCT
      s.student_id,
      u.name,
      s.roll_no,
      s.course,
      s.year,
      s.gender,
      s.phone,
      s.guardian_phone
    FROM student s
    JOIN user u ON s.user_id = u.user_id
    JOIN allocation a ON s.student_id = a.student_id
  `;
  const params = [];

  if (gender && year) {
    query += " WHERE s.gender = ? AND s.year = ?";
    params.push(gender, year);
  }

  query += " ORDER BY s.year, s.roll_no";

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results);
  });
});

/* ================= SEARCH STUDENTS (filtered by hostel) ================= */
app.get("/warden/search-students", (req, res) => {
  const q = `%${req.query.q || ""}%`;
  const { gender, year } = req.query;

  let query = `
    SELECT s.student_id, u.name, s.roll_no, s.course, s.year
    FROM student s
    JOIN user u ON s.user_id = u.user_id
    WHERE s.roll_no LIKE ?
  `;
  const params = [q];

  if (gender && year) {
    query += " AND s.gender = ? AND s.year = ?";
    params.push(gender, year);
  }

  query += " LIMIT 20";

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results);
  });
});

const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(
  "477337841144-596jtcqrupb9ld43l3mlvuis8bt6oako.apps.googleusercontent.com"
);

/* ================= GOOGLE AUTH ================= */
// ✅ Allowed admin email(s) — wardens are now managed via warden table
const ADMIN_EMAILS = ["ishanbhati.edu@gmail.com"];

app.post("/auth/google", async (req, res) => {
  const { name, email, picture, requestedRole } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email not received from Google" });
  }

  const role = (requestedRole || "STUDENT").toUpperCase();

  // ✅ Email validation based on requested role
  if (role === "STUDENT") {
    if (!email.endsWith("@mitsgwl.ac.in")) {
      return res.status(403).json({
        message: "Only MITS Gwalior college email (@mitsgwl.ac.in) is allowed for student login",
      });
    }
  } else if (role === "ADMIN") {
    if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
      return res.status(403).json({
        message: "You are not authorized to login as Admin",
      });
    }
  } else if (role === "WARDEN") {
    // Wardens are validated against the warden table (admin must pre-register them)
    // We check after user lookup below
  } else {
    return res.status(400).json({ message: "Invalid role requested" });
  }

  try {
    // 1️⃣ Check if user already exists by email
    db.query(
      "SELECT * FROM user WHERE email = ?",
      [email],
      (err, users) => {
        if (err)
          return res.status(500).json({ message: "Database error" });

        // 🔹 EXISTING USER
        if (users.length > 0) {
          const existingUser = users[0];

          // For WARDEN role, verify they exist in warden table
          if (role === "WARDEN") {
            db.query(
              "SELECT w.*, h.hostel_name FROM warden w JOIN hostel h ON w.hostel_id = h.hostel_id WHERE w.user_id = ?",
              [existingUser.user_id],
              (err, wardenRows) => {
                if (err) return res.status(500).json({ message: "Database error" });
                if (wardenRows.length === 0) {
                  return res.status(403).json({
                    message: "You are not registered as a warden. Please contact the admin to get assigned to a hostel.",
                  });
                }
                // Update role if needed
                if (existingUser.role !== "WARDEN") {
                  db.query("UPDATE user SET role = 'WARDEN' WHERE user_id = ?", [existingUser.user_id]);
                }
                return res.json({
                  message: "Login successful",
                  user: { ...existingUser, role: "WARDEN" },
                });
              }
            );
            return;
          }

          // For ADMIN role, check email is in admin list
          if (role === "ADMIN") {
            if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
              return res.status(403).json({ message: "You are not authorized to login as Admin" });
            }
            if (existingUser.role !== "ADMIN") {
              db.query("UPDATE user SET role = 'ADMIN' WHERE user_id = ?", [existingUser.user_id]);
            }
            return res.json({
              message: "Login successful",
              user: { ...existingUser, role: "ADMIN" },
            });
          }

          // STUDENT role — parse name if needed and log them in
          if (existingUser.role === role) {
            // Check if roll_no needs to be extracted from the Google name
            db.query(
              "SELECT roll_no FROM student WHERE user_id = ?",
              [existingUser.user_id],
              (err, studentRows) => {
                if (!err && studentRows.length > 0 && !studentRows[0].roll_no) {
                  // MITS Google name format: "RollNo FirstName MiddleName LastName"
                  const nameParts = (name || "").trim().split(/\s+/);
                  if (nameParts.length >= 2) {
                    const roll_no = nameParts[0];
                    const actualName = nameParts.slice(1).join(" ");
                    db.query("UPDATE user SET name = ? WHERE user_id = ?", [actualName, existingUser.user_id]);
                    db.query("UPDATE student SET roll_no = ? WHERE user_id = ?", [roll_no, existingUser.user_id]);
                    return res.json({
                      message: "Login successful",
                      user: { ...existingUser, name: actualName },
                    });
                  }
                }
                return res.json({
                  message: "Login successful",
                  user: existingUser,
                });
              }
            );
            return;
          }

          return res.status(403).json({
            message: "You are not authorized to login as " + role,
          });
        }

        // 🔹 NEW USER
        if (role === "WARDEN") {
          // Warden must be pre-registered by admin
          return res.status(403).json({
            message: "You are not registered as a warden. Please contact the admin to get assigned to a hostel.",
          });
        }

        if (role === "ADMIN" && !ADMIN_EMAILS.includes(email.toLowerCase())) {
          return res.status(403).json({ message: "You are not authorized to login as Admin" });
        }

        db.query(
          "INSERT INTO user (name, email, role) VALUES (?, ?, ?)",
          [name, email, role],
          (err, result) => {
            if (err)
              return res.status(500).json({ message: "User creation failed" });

            const user_id = result.insertId;

            if (role === "STUDENT") {
              // MITS Google accounts have name format: "RollNo FirstName MiddleName LastName"
              // e.g. "0901CS221001 Ishan Bhati" → roll_no = "0901CS221001", actualName = "Ishan Bhati"
              const nameParts = (name || "").trim().split(/\s+/);
              let roll_no = null;
              let actualName = name;

              if (nameParts.length >= 2) {
                roll_no = nameParts[0];
                actualName = nameParts.slice(1).join(" ");
                // Update user name to actual name (without roll number)
                db.query("UPDATE user SET name = ? WHERE user_id = ?", [actualName, user_id]);
              }

              db.query(
                `INSERT INTO student (user_id, roll_no, course, year, gender, phone)
                 VALUES (?, ?, NULL, NULL, NULL, NULL)`,
                [user_id, roll_no],
                () => {
                  res.json({
                    message: "Google login successful",
                    user: { user_id, name: actualName, email, role },
                  });
                }
              );
            } else {
              res.json({
                message: "Google login successful",
                user: { user_id, name, email, role },
              });
            }
          }
        );
      }
    );
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(500).json({ message: "Google authentication failed" });
  }
});


/* ================= ROOMS (filtered by hostel) ================= */
app.get("/warden/rooms", (req, res) => {
  const { hostel_id } = req.query;

  let query = `
    SELECT r.room_id, r.room_number, r.capacity, r.occupied_count,
           h.hostel_name, h.hostel_type
    FROM room r
    JOIN hostel h ON r.hostel_id = h.hostel_id
  `;
  const params = [];

  if (hostel_id) {
    query += " WHERE r.hostel_id = ?";
    params.push(hostel_id);
  }

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results);
  });
});

/* ================= FEE STRUCTURE ================= */

// Get fee structure for a specific year+gender (student view)
app.get("/fee-structure", (req, res) => {
  const { year, gender } = req.query;
  if (!year || !gender)
    return res.status(400).json({ message: "Year and gender are required" });

  db.query(
    "SELECT * FROM fee_structure WHERE year = ? AND gender = ? ORDER BY id",
    [year, gender],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json(results);
    }
  );
});

// Get all fee structures (admin view)
app.get("/fee-structure/all", (req, res) => {
  db.query(
    "SELECT * FROM fee_structure ORDER BY gender, year, id",
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json(results);
    }
  );
});

// Add a fee component (admin)
app.post("/fee-structure", (req, res) => {
  const { year, gender, component, fee_type, amount, period_from, period_to } = req.body;
  if (!year || !gender || !component || !amount)
    return res.status(400).json({ message: "All fields required" });

  db.query(
    "INSERT INTO fee_structure (year, gender, component, fee_type, amount, period_from, period_to) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [year, gender, component, fee_type || "Semester", amount, period_from || null, period_to || null],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY")
          return res.status(409).json({ message: "This fee component already exists for this year/gender" });
        return res.status(500).json({ message: "Database error" });
      }
      res.json({ message: "Fee component added", id: result.insertId });
    }
  );
});

// Update a fee component (admin)
app.put("/fee-structure/:id", (req, res) => {
  const { component, fee_type, amount, period_from, period_to } = req.body;
  db.query(
    "UPDATE fee_structure SET component = ?, fee_type = ?, amount = ?, period_from = ?, period_to = ? WHERE id = ?",
    [component, fee_type, amount, period_from || null, period_to || null, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json({ message: "Fee component updated" });
    }
  );
});

// Delete a fee component (admin)
app.delete("/fee-structure/:id", (req, res) => {
  db.query(
    "DELETE FROM fee_structure WHERE id = ?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json({ message: "Fee component deleted" });
    }
  );
});

// Get fee summary for a student (paid amount from fee/payment tables)
app.get("/student-fee-summary/:studentId", (req, res) => {
  db.query(
    `
    SELECT f.fee_id, f.semester, f.total_amount, f.due_amount, f.status,
           COALESCE(SUM(p.amount_paid), 0) AS paid_amount
    FROM fee f
    LEFT JOIN payment p ON f.fee_id = p.fee_id
    WHERE f.student_id = ?
    GROUP BY f.fee_id
    ORDER BY f.semester DESC
    `,
    [req.params.studentId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json(results);
    }
  );
});

/* ================= ADMIN: SEARCH UNALLOCATED STUDENTS (for allocation) ================= */
app.get("/admin/search-students-for-allocation", (req, res) => {
  const q = `%${req.query.q || ""}%`;
  const { hostel_id } = req.query;

  // Find the hostel's type and year to filter eligible students
  if (!hostel_id) {
    return res.status(400).json({ message: "hostel_id is required" });
  }

  db.query(
    "SELECT hostel_type, for_year FROM hostel WHERE hostel_id = ?",
    [hostel_id],
    (err, hostelRows) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (hostelRows.length === 0) return res.status(404).json({ message: "Hostel not found" });

      const { hostel_type, for_year } = hostelRows[0];
      const gender = hostel_type === "Boys" ? "Male" : "Female";

      db.query(
        `
        SELECT s.student_id, u.name, s.roll_no, s.course, s.year, s.gender
        FROM student s
        JOIN user u ON s.user_id = u.user_id
        WHERE s.roll_no LIKE ?
          AND s.gender = ?
          AND s.year = ?
          AND s.student_id NOT IN (SELECT student_id FROM allocation)
        LIMIT 20
        `,
        [q, gender, for_year],
        (err, results) => {
          if (err) return res.status(500).json({ message: "Database error" });
          res.json(results);
        }
      );
    }
  );
});

/* ================= ADMIN: MANAGE STUDENTS ================= */

// List all students with optional filters
app.get("/admin/students", (req, res) => {
  const { year, gender, search } = req.query;

  let query = `
    SELECT s.student_id, u.name, u.email, s.roll_no, s.course, s.year, s.gender, s.phone,
           r.room_number, h.hostel_name, h.hostel_type
    FROM student s
    JOIN user u ON s.user_id = u.user_id
    LEFT JOIN allocation a ON s.student_id = a.student_id
    LEFT JOIN room r ON a.room_id = r.room_id
    LEFT JOIN hostel h ON r.hostel_id = h.hostel_id
    WHERE 1=1
  `;
  const params = [];

  if (year) { query += " AND s.year = ?"; params.push(year); }
  if (gender) { query += " AND s.gender = ?"; params.push(gender); }
  if (search) {
    query += " AND (u.name LIKE ? OR s.roll_no LIKE ? OR s.course LIKE ?)";
    const q = `%${search}%`;
    params.push(q, q, q);
  }

  query += " ORDER BY s.year, s.roll_no";

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results);
  });
});

// Get detailed student info
app.get("/admin/student/:studentId", (req, res) => {
  db.query(
    `
    SELECT s.student_id, u.name, u.email, s.roll_no, s.course, s.year, s.gender, s.phone,
           s.profile_picture, r.room_number, r.room_id, r.capacity, h.hostel_name, h.hostel_type,
           a.allocation_date
    FROM student s
    JOIN user u ON s.user_id = u.user_id
    LEFT JOIN allocation a ON s.student_id = a.student_id
    LEFT JOIN room r ON a.room_id = r.room_id
    LEFT JOIN hostel h ON r.hostel_id = h.hostel_id
    WHERE s.student_id = ?
    `,
    [req.params.studentId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (results.length === 0) return res.status(404).json({ message: "Student not found" });
      res.json(results[0]);
    }
  );
});

// Deallocate a student from their room
app.delete("/admin/student/:studentId/deallocate", (req, res) => {
  const studentId = req.params.studentId;

  db.query("SELECT room_id FROM allocation WHERE student_id = ?", [studentId], (err, rows) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (rows.length === 0) return res.status(404).json({ message: "Student has no room allocation" });

    const roomId = rows[0].room_id;

    db.query("DELETE FROM allocation WHERE student_id = ?", [studentId], (err) => {
      if (err) return res.status(500).json({ message: "Failed to deallocate student" });

      db.query("UPDATE room SET occupied_count = GREATEST(occupied_count - 1, 0) WHERE room_id = ?", [roomId], (err) => {
        if (err) console.error("Failed to update room count:", err);
        res.json({ message: "Student deallocated successfully" });
      });
    });
  });
});

/* ================= ADMIN: MANAGE HOSTELS ================= */

// List all hostels with room stats
app.get("/admin/hostels", (req, res) => {
  db.query(
    `
    SELECT h.hostel_id, h.hostel_name, h.hostel_type, h.for_year,
           COUNT(r.room_id) AS total_rooms,
           COALESCE(SUM(r.capacity), 0) AS total_capacity,
           COALESCE(SUM(r.occupied_count), 0) AS total_occupied
    FROM hostel h
    LEFT JOIN room r ON h.hostel_id = r.hostel_id
    GROUP BY h.hostel_id
    ORDER BY h.hostel_type, h.for_year
    `,
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json(results);
    }
  );
});

// Create a new hostel
app.post("/admin/hostel", (req, res) => {
  const { hostel_name, hostel_type, for_year } = req.body;
  if (!hostel_name || !hostel_type || !for_year)
    return res.status(400).json({ message: "All fields are required" });

  db.query(
    "INSERT INTO hostel (hostel_name, hostel_type, for_year) VALUES (?, ?, ?)",
    [hostel_name, hostel_type, for_year],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY")
          return res.status(409).json({ message: "A hostel with this name already exists" });
        return res.status(500).json({ message: "Database error" });
      }
      res.json({ message: "Hostel created successfully", hostel_id: result.insertId });
    }
  );
});

// Update a hostel
app.put("/admin/hostel/:hostelId", (req, res) => {
  const { hostel_name, hostel_type, for_year } = req.body;
  db.query(
    "UPDATE hostel SET hostel_name = ?, hostel_type = ?, for_year = ? WHERE hostel_id = ?",
    [hostel_name, hostel_type, for_year, req.params.hostelId],
    (err) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json({ message: "Hostel updated successfully" });
    }
  );
});

// Bulk add rooms to a hostel
app.post("/admin/hostel/:hostelId/rooms", (req, res) => {
  const { rooms } = req.body; // array of { room_number, capacity }
  const hostelId = req.params.hostelId;

  if (!rooms || !Array.isArray(rooms) || rooms.length === 0)
    return res.status(400).json({ message: "Rooms array is required" });

  const values = rooms.map(r => [hostelId, r.room_number, r.capacity, 0]);
  db.query(
    "INSERT INTO room (hostel_id, room_number, capacity, occupied_count) VALUES ?",
    [values],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY")
          return res.status(409).json({ message: "Some room numbers already exist in this hostel" });
        return res.status(500).json({ message: "Database error" });
      }
      res.json({ message: `${result.affectedRows} room(s) added successfully` });
    }
  );
});

// Update room capacity
app.put("/admin/room/:roomId", (req, res) => {
  const { capacity } = req.body;
  db.query(
    "UPDATE room SET capacity = ? WHERE room_id = ?",
    [capacity, req.params.roomId],
    (err) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json({ message: "Room updated successfully" });
    }
  );
});

// Delete a room (only if empty)
app.delete("/admin/room/:roomId", (req, res) => {
  db.query("SELECT occupied_count FROM room WHERE room_id = ?", [req.params.roomId], (err, rows) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (rows.length === 0) return res.status(404).json({ message: "Room not found" });
    if (rows[0].occupied_count > 0)
      return res.status(400).json({ message: "Cannot delete a room that has students allocated" });

    db.query("DELETE FROM room WHERE room_id = ?", [req.params.roomId], (err) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json({ message: "Room deleted successfully" });
    });
  });
});

// Get rooms for a specific hostel
app.get("/admin/hostel/:hostelId/rooms", (req, res) => {
  db.query(
    "SELECT room_id, room_number, capacity, occupied_count FROM room WHERE hostel_id = ? ORDER BY room_number",
    [req.params.hostelId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json(results);
    }
  );
});

/* ================= ADMIN: REPORTS ================= */

// Occupancy report (hostel-wise)
app.get("/admin/reports/occupancy", (req, res) => {
  db.query(
    `
    SELECT h.hostel_id, h.hostel_name, h.hostel_type, h.for_year,
           COUNT(r.room_id) AS total_rooms,
           COALESCE(SUM(r.capacity), 0) AS total_capacity,
           COALESCE(SUM(r.occupied_count), 0) AS total_occupied,
           COALESCE(SUM(r.capacity), 0) - COALESCE(SUM(r.occupied_count), 0) AS vacant
    FROM hostel h
    LEFT JOIN room r ON h.hostel_id = r.hostel_id
    GROUP BY h.hostel_id
    ORDER BY h.hostel_type, h.for_year
    `,
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json(results);
    }
  );
});

// Fee collection summary
app.get("/admin/reports/fees", (req, res) => {
  db.query(
    `
    SELECT fs.year, fs.gender,
           COALESCE(SUM(fs.amount), 0) AS fee_per_student,
           (SELECT COUNT(*) FROM student s WHERE s.year = fs.year AND s.gender = fs.gender) AS student_count
    FROM fee_structure fs
    GROUP BY fs.year, fs.gender
    ORDER BY fs.year, fs.gender
    `,
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });

      const report = results.map(r => ({
        year: r.year,
        gender: r.gender,
        fee_per_student: Number(r.fee_per_student),
        student_count: Number(r.student_count),
        total_expected: Number(r.fee_per_student) * Number(r.student_count),
      }));
      res.json(report);
    }
  );
});

// Complaint summary
app.get("/admin/reports/complaints", (req, res) => {
  db.query(
    `
    SELECT 
      category,
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'Open' THEN 1 ELSE 0 END) AS open_count,
      SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS in_progress,
      SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) AS resolved
    FROM complaint
    GROUP BY category
    ORDER BY total DESC
    `,
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json(results);
    }
  );
});

/* ================= ADMIN: SYSTEM SETTINGS ================= */

// Auto-create settings table if it doesn't exist
db.query(`
  CREATE TABLE IF NOT EXISTS system_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) { console.error("Failed to create system_settings table:", err); return; }
  // Seed defaults
  const defaults = [
    ['academic_year', '2025-26'],
    ['contact_email', 'admin@mitsgwl.ac.in'],
    ['contact_phone', ''],
    ['hostel_rules_boys', ''],
    ['hostel_rules_girls', ''],
    ['college_name', 'Madhav Institute of Technology and Science, Gwalior [M.P]'],
    ['college_subtitle', 'Deemed University'],
    ['hero_subtitle', 'Experience a safe, comfortable, and vibrant campus life at Madhav Institute of Technology and Science [DU], Gwalior.'],
    ['marquee_text', 'Welcome to official Hostel Management System of MITS Gwalior|Login via Student Email to get access to all features'],
    ['contact_phone_footer', '+91-751-2409300'],
    ['contact_email_footer', 'hostel@mitsgwalior.in'],
    ['college_address', 'Race Course Road, Gwalior Police Line Area, Gwalior, MP-474002, India'],
    ['copyright_text', '© 2026 MITS Hostel Management System. All rights reserved.'],
    ['footer_brand_text', 'Madhav Institute of Technology & Science, Race Course Road, Gwalior, M.P. - 474005'],
  ];
  defaults.forEach(([key, val]) => {
    db.query("INSERT IGNORE INTO system_settings (setting_key, setting_value) VALUES (?, ?)", [key, val]);
  });
});

// Get all settings (public - for landing page)
app.get("/public/settings", (req, res) => {
  db.query("SELECT setting_key, setting_value FROM system_settings", (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    const settings = {};
    results.forEach(r => { settings[r.setting_key] = r.setting_value; });
    res.json(settings);
  });
});

// Get all settings (admin)
app.get("/admin/settings", (req, res) => {
  db.query("SELECT setting_key, setting_value FROM system_settings", (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    const settings = {};
    results.forEach(r => { settings[r.setting_key] = r.setting_value; });
    res.json(settings);
  });
});

// Bulk update settings
app.put("/admin/settings", (req, res) => {
  const settings = req.body; // { key: value, key2: value2, ... }
  if (!settings || typeof settings !== "object")
    return res.status(400).json({ message: "Settings object required" });

  const entries = Object.entries(settings);
  let completed = 0;
  let hasError = false;

  entries.forEach(([key, val]) => {
    db.query(
      "INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = CURRENT_TIMESTAMP",
      [key, val, val],
      (err) => {
        if (err && !hasError) { hasError = true; return res.status(500).json({ message: "Database error" }); }
        completed++;
        if (completed === entries.length && !hasError) {
          res.json({ message: "Settings updated successfully" });
        }
      }
    );
  });
});

/* ================= GALLERY ================= */
const fs = require("fs");

// Separate multer for gallery uploads
const galleryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "uploads", "gallery");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `gallery_${Date.now()}_${Math.round(Math.random() * 1000)}${ext}`);
  },
});
const galleryUpload = multer({
  storage: galleryStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error("Only image files are allowed"));
  },
});

// Serve gallery uploads statically
app.use("/uploads/gallery", express.static(path.join(__dirname, "uploads", "gallery")));

// Public: Get all gallery images (optionally filtered by category)
app.get("/public/gallery", (req, res) => {
  const { category } = req.query;
  let query = "SELECT * FROM gallery_images";
  const params = [];

  if (category && ["main", "boys", "girls"].includes(category)) {
    query += " WHERE category = ?";
    params.push(category);
  }

  query += " ORDER BY display_order ASC, created_at DESC";

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results);
  });
});

// Admin: Upload gallery image
app.post("/admin/gallery", galleryUpload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image file provided" });

  const { category, caption, display_order } = req.body;
  const validCategories = ["main", "boys", "girls"];
  const cat = validCategories.includes(category) ? category : "main";
  const imagePath = `/uploads/gallery/${req.file.filename}`;

  db.query(
    "INSERT INTO gallery_images (category, image_path, caption, display_order) VALUES (?, ?, ?, ?)",
    [cat, imagePath, caption || null, display_order || 0],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json({
        message: "Image uploaded successfully",
        image: {
          id: result.insertId,
          category: cat,
          image_path: imagePath,
          caption: caption || null,
          display_order: display_order || 0,
        },
      });
    }
  );
});

// Admin: Delete gallery image
app.delete("/admin/gallery/:id", (req, res) => {
  const { id } = req.params;

  // First get the image path to delete the file
  db.query("SELECT image_path FROM gallery_images WHERE id = ?", [id], (err, rows) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (rows.length === 0) return res.status(404).json({ message: "Image not found" });

    const filePath = path.join(__dirname, rows[0].image_path);

    db.query("DELETE FROM gallery_images WHERE id = ?", [id], (err) => {
      if (err) return res.status(500).json({ message: "Database error" });

      // Try to delete the file from disk
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (e) {
        console.warn("Could not delete gallery file:", e.message);
      }

      res.json({ message: "Image deleted successfully" });
    });
  });
});

// Admin: Update gallery image caption/order
app.put("/admin/gallery/:id", (req, res) => {
  const { id } = req.params;
  const { caption, display_order, category } = req.body;

  const fields = [];
  const params = [];

  if (caption !== undefined) { fields.push("caption = ?"); params.push(caption); }
  if (display_order !== undefined) { fields.push("display_order = ?"); params.push(display_order); }
  if (category && ["main", "boys", "girls"].includes(category)) { fields.push("category = ?"); params.push(category); }

  if (fields.length === 0) return res.status(400).json({ message: "No fields to update" });

  params.push(id);
  db.query(`UPDATE gallery_images SET ${fields.join(", ")} WHERE id = ?`, params, (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Image not found" });
    res.json({ message: "Image updated successfully" });
  });
});

/* ================= SERVER ================= */
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
