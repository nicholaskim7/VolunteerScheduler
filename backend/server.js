const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require('multer');
const path = require("path");
const cookieParser = require("cookie-parser");
const { Parser } = require('json2csv');
const pdf = require('html-pdf');
const fs = require('fs');
const ejs = require('ejs');


const salt = 10; // encrypted with 10 characters

const app = express();
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173"],
    methods: ["POST", "GET", 'PUT', 'DELETE'],
    credentials: true
}));
app.use(cookieParser()); // needed for cookies
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "volunteer_management"
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database.');
});

// Storage for profile pic, might not be necessary
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// User routes
app.get("/", (req, res) => {
    const sql = "SELECT * FROM userprofile";
    db.query(sql, (err, data) => {
        if(err) return res.json("Error");
        return res.json(data);
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM usercredentials WHERE email = ?";

    db.query(sql, [email], (err, data) => {
        if (err) return res.status(500).json({ message: "Login Error" });
        if (data.length > 0) {
            const hashedPassword = data[0].password;
            const role = data[0].role;
            console.log(hashedPassword);
            console.log(password);
            bcrypt.compare(password.toString(), hashedPassword, (err, response) => { //compare hashed database password to entered password hashed
                if (err) return res.status(500).json({ message: "Password compare error" });
                if (response) {
                    const userId = data[0].user_id;
                    const token = jwt.sign({ userId }, "secret_key_123", { expiresIn: '1d' });
                    res.cookie('token', token);
                    
                    // Check the role and redirect accordingly
                    if (role === 'admin') {
                        return res.json({ message: "Login successful...", redirectUrl: "/events", userId });
                    } else {
                        return res.json({ message: "Login successful...", redirectUrl: `/loggedin/${userId}`, userId });
                    }
                } else {
                    return res.status(401).json({ message: "Password not matched" });
                }
            });
        } else {
            return res.status(401).json({ message: "Login Error. Please try again. If you don't have an account please create one." });
        }
    });
});


app.post('/create', (req, res) => {
    const { name, email, password } = req.body;
    
    db.beginTransaction((err) => {
        if (err) {
            console.error('Transaction Error:', err);
            return res.json({ message: "Transaction Error" });
        }

        const userProfileSql = "INSERT INTO userprofile (`full_name`) VALUES (?)";  // insert user profile info
        const userCredentialsSql = "INSERT INTO usercredentials (`user_id`, `email`, `password`) VALUES (?, ?, ?)";  // insert user credentials

        bcrypt.hash(password.toString(), salt, (err, hash) => {
            if (err) {
                console.error('Hashing Error:', err);
                return res.json({ message: "Error for hashing password" });
            }

            // Insert into user profile
            db.query(userProfileSql, [name], (err, result) => {
                if (err) {
                    console.error('UserProfile Insert Error:', err);
                    return res.json({ message: "UserProfile Insert Error" });
                }

                const userId = result.insertId;

                // Insert into user credentials
                db.query(userCredentialsSql, [userId, email, hash], (err, result) => {
                    if (err) {
                        console.error('UserCredentials Insert Error:', err);
                        return res.json({ message: "UserCredentials Insert Error" });
                    }

                    db.commit((err) => {
                        if (err) {
                            console.error('Commit Error:', err);
                            return res.json({ message: "Commit Error" });
                        }

                        res.status(201).json({ message: "User created successfully...", userId });
                    });
                });
            });
        });
    });
});

const verifyUser = (req, res, next) => { //once user is loggedin we verify by checking if we have the corect token or not
    const token = req.cookies.token;
    if(!token) {
        return res.json({ message: "You are not Authorized" });
    } else {
        jwt.verify(token, "secret_key_123", (err, decoded) => {
            if(err) {
                return res.json({ message: "Token is not ok" });
            } else {
                req.userId = decoded.userId;
                next();
            }
        })
    }
}


//once user is logged in they are redirected to there profile page
app.get('/user/:id', verifyUser, (req, res) => {
    const { id } = req.params;
    const sqlProfile = "SELECT user_id, full_name, username, profile_picture, address1, address2, city, state, zipcode, skills, preferences, availability FROM userprofile WHERE user_id = ?";
    const sqlCredentials = "SELECT email FROM usercredentials WHERE user_id = ?";

    db.query(sqlProfile, [id], (err, profileData) => {
        if (err) return res.status(500).json({ message: "Error fetching profile" });
        if (profileData.length > 0) {
            db.query(sqlCredentials, [id], (err, credentialsData) => {
                if (err) return res.status(500).json({ message: "Error fetching credentials" });
                if (credentialsData.length > 0) {
                    return res.json({ Status: "Success", user: { ...profileData[0], ...credentialsData[0] } });
                } else {
                    return res.status(404).json({ message: "Credentials not found" });
                }
            });
        } else {
            return res.status(404).json({ message: "User profile not found" });
        }
    });
});


//update user profile
app.put('/user/:id/update', upload.single('profile_picture'), (req, res) => {
    const { id } = req.params;
    const { full_name, username } = req.body;
    let profilePic = null;
    if (req.file) {
        profilePic = `/uploads/${req.file.filename}`;
    }
    let sql = "UPDATE userprofile SET full_name = ?, username = ?";
    let params = [full_name, username];

    if (profilePic) {
        sql += ", profile_picture = ?";
        params.push(profilePic);
    }
    
    sql += " WHERE user_id = ?";
    params.push(id);

    db.query(sql, params, (err, result) => {
        if (err) return res.status(500).json({ message: "Error updating user profile" });
        return res.json({ message: "User profile updated successfully" });
    });
});

//update user credentials
app.put('/update/:id', (req, res) => {
    const { id } = req.params;
    const { email, password } = req.body;

    let sql = "UPDATE usercredentials SET email = ?";
    let params = [email];

    if (password) {
        bcrypt.hash(password.toString(), salt, (err, hash) => {
            if (err) return res.status(500).json({ message: "Error hashing password" });

            sql += ", password = ?";
            params.push(hash);

            sql += " WHERE user_id = ?";
            params.push(id);

            db.query(sql, params, (err, result) => {
                if (err) return res.status(500).json({ message: "Error updating user credentials" });
                return res.json({ message: "User credentials updated successfully" });
            });
        });
    } else {
        sql += " WHERE user_id = ?";
        params.push(id);

        db.query(sql, params, (err, result) => {
            if (err) return res.status(500).json({ message: "Error updating user credentials" });
            return res.json({ message: "User credentials updated successfully" });
        });
    }
});


//clear cookies so now when you refresh you will no longer be authenticated. (this fixes bypassing login thru url)
app.get('/user/:id/logout', (req, res) => {
    res.clearCookie('token');
    return res.json({status: "Success"});
})


//update profile management info
app.put('/profile-management/:id', (req, res) => {
    const { id } = req.params;
    const { name, address1, address2, city, state, zipcode, skills, preferences, availability } = req.body;
    const sql = "UPDATE userprofile SET `full_name` = ?, `address1` = ?, `address2` = ?, `city` = ?, `state` = ?, `zipcode` = ?, `skills` = ?, `preferences` = ?, `availability` = ? WHERE user_id = ?";
    db.query(sql, [name, address1, address2, city, state, zipcode, JSON.stringify(skills), preferences, JSON.stringify(availability), id], (err, result) => {
        if (err) return res.status(500).json({ message: "Error updating profile management" });
        return res.json({ message: "profile managed successfully" });
    });
});


//logic to remove user (need to delete from both tables since split into two different tables)
app.delete('/user/:id', (req, res) => {
    const { id } = req.params;
    
    db.beginTransaction((err) => {
        if (err) {
            console.error('Transaction Error:', err);
            return res.status(500).json({ message: "Transaction Error" });
        }

        const deleteProfileSql = "DELETE FROM userprofile WHERE user_id = ?";
        const deleteCredentialsSql = "DELETE FROM usercredentials WHERE user_id = ?";

        // Delete from userprofile
        db.query(deleteProfileSql, [id], (err, result) => {
            if (err) {
                console.error('Error deleting from userprofile:', err);
                return db.rollback(() => {
                    res.status(500).json({ message: "Error deleting from userprofile" });
                });
            }

            // Delete from usercredentials
            db.query(deleteCredentialsSql, [id], (err, result) => {
                if (err) {
                    console.error('Error deleting from usercredentials:', err);
                    return db.rollback(() => {
                        res.status(500).json({ message: "Error deleting from usercredentials" });
                    });
                }

                db.commit((err) => {
                    if (err) {
                        console.error('Transaction Commit Error:', err);
                        return db.rollback(() => {
                            res.status(500).json({ message: "Transaction Commit Error" });
                        });
                    }
                    res.json({ message: "User deleted successfully" });
                });
            });
        });
    });
});


// Event routes
app.get("/events", (req, res) => {
    const sql = "SELECT * FROM eventdetails";
    db.query(sql, (err, data) => {
        if(err) return res.json("Error");
        return res.json(data);
    });
});

app.post('/events/create', (req, res) => {
    const sql = "INSERT INTO eventdetails (`event_name`, `description`, `location`, `required_skills`, `urgency`, `event_date`) VALUES (?)";
    const values = [
        req.body.name,
        req.body.description,
        req.body.location,
        JSON.stringify(req.body.requiredSkills),
        req.body.urgency,
        req.body.date
    ];
    db.query(sql, [values], (err, data) => {
        if(err) return res.json("Error");
        return res.json(data);
    });
});

app.put('/events/update/:event_id', (req, res) => {
    const event_id = req.params.event_id;
    const {name, description, location, requiredSkills, urgency, date} = req.body;

    const sql = `UPDATE eventdetails SET event_name = ?, description = ?, location = ?, required_skills = ?, urgency = ?, event_date = ? WHERE event_id = ?`;

    const notificationMessage = `Event "${name}" has been updated.`;

    const notifyQuery = `INSERT INTO notifications (user_id, message) SELECT vh.user_id, ? FROM volunteerhistory vh WHERE vh.event_id = ?`;

    const values = [name, description, location, JSON.stringify(requiredSkills), urgency, date, event_id];

    // Update the event
    db.query(sql, values, (updateErr, updateData) => {
        if (updateErr) {
            console.error('Error updating event:', updateErr);
            return res.status(500).json({ error: 'Update error' });
        }

        // Send notifications
        db.query(notifyQuery, [notificationMessage, event_id], (notifyErr, notifyData) => {
            if (notifyErr) {
                console.error('Error sending notifications:', notifyErr);
                return res.status(500).json({ error: 'Notification error' });
            }

            res.status(200).json({ message: 'Event updated and volunteers notified successfully' });
        });
    });
});

app.delete('/events/:event_id', (req, res) => {
    const sql = "DELETE FROM eventdetails WHERE event_id = ?";
    const event_id = req.params.event_id;

    db.query(sql, [event_id], (err, data) => {
        if(err) return res.json("Error");
        return res.json(data);
    });
});

// Volunteer matching
app.get("/volunteers", (req, res) => {
    const sql = "SELECT * FROM userprofile";
    db.query(sql, (err, data) => {
        if(err) return res.json("Error");
        return res.json(data);
    });
});

app.put('/volunteers/match/:user_id', (req, res) => {
    const { user_id } = req.params;
    const { event_id, participation } = req.body;

    const sql = "INSERT INTO volunteerhistory (user_id, event_id, participation) VALUES (?, ?, ?)";
    const values = [user_id, event_id, participation];

    db.query(sql, values, (err, data) => {
        if (err) {
            console.error("Error inserting into volunteerhistory:", err);
            return res.status(500).json({ error: "Error inserting into volunteerhistory" });
        }

        const eventQuery = "SELECT event_name FROM eventdetails WHERE event_id = ?";
        db.query(eventQuery, [event_id], (eventErr, eventData) => {
            if (eventErr) {
                console.error("Error retrieving event name:", eventErr);
                return res.status(500).json({ error: "Error retrieving event name" });
            }

            if (eventData.length === 0) {
                return res.status(404).json({ error: "Event not found" });
            }

            const eventName = eventData[0].event_name;
            const notifyMessage = `You've been matched with the "${eventName}" event.`;

            const notifyQuery = `INSERT INTO notifications (user_id, message) VALUES (?, ?)`;
            db.query(notifyQuery, [user_id, notifyMessage], (notifyErr) => {
                if (notifyErr) {
                    console.error("Error sending notifications:", notifyErr);
                    return res.status(500).json({ error: "Error sending notifications" });
                }
                res.status(200).json({ message: 'Volunteer matched and notified successfully' });
            });
        });
    });
});


// Notification routes
app.get('/notifications', (req, res) => {
    const userId = req.query.userId;
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    const query = 'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC';
    db.query(query, [userId], (error, results) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ error: 'Error retrieving notifications' });
        }
        res.json(results);
    });
});

app.delete('/notifications/:id', (req, res) => {
    const userId = req.query.userId;
    const { id } = req.params;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    const query = 'DELETE FROM notifications WHERE notification_id = ? AND user_id = ?';
    db.query(query, [id, userId], (error, results) => {
        if (error) return res.status(500).json({ message: "Error dismissing notification" });
        res.status(204).send();
    });
});

// Volunteer history routes
app.get('/volunteerHistory', (req, res) => {
    const user_id = req.query.user_id;
    if (!user_id) return res.status(400).json({ error: 'User ID is required' });

    const query = 'SELECT vh.participation, e.event_name, e.description, e.location, e.required_skills, e.urgency, e.event_date FROM volunteerhistory vh JOIN eventdetails e ON vh.event_id = e.event_id WHERE vh.user_id = ? ORDER BY e.event_date DESC';
    db.query(query, [user_id], (error, results) => {
        if (error) return res.status(500).json({ message: "Error retrieving volunteer history" });
        res.json(results);
    });
});

// Pricing routes
app.post('/pricing', (req, res) => {
    const { name, description, price } = req.body;
    if (!name || !price) return res.status(400).json({ error: 'Name and price are required' });

    const query = 'INSERT INTO pricing (name, description, price) VALUES (?, ?, ?)';
    db.query(query, [name, description, price], (error, results) => {
        if (error) return res.status(500).json({ message: "Error creating pricing entry" });
        res.status(201).json({ id: results.insertId, name, description, price });
    });
});

// Pricing routes
app.post('/pricing', (req, res) => {
    const { name, description, price } = req.body;
    if (!name || !price) return res.status(400).json({ error: 'Name and price are required' });

    const query = 'INSERT INTO pricing (name, description, price) VALUES (?, ?, ?)';
    db.query(query, [name, description, price], (error, results) => {
        if (error) return res.status(500).json({ message: "Error creating pricing entry" });
        res.status(201).json({ id: results.insertId, name, description, price });
    });
});

app.get('/pricing', (req, res) => {
    const query = 'SELECT * FROM pricing';
    db.query(query, (error, results) => {
        if (error) return res.status(500).json({ message: "Error retrieving pricing entries" });
        res.json(results);
    });
});

app.get('/pricing/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM pricing WHERE id = ?';
    db.query(query, [id], (error, results) => {
        if (error) return res.status(500).json({ error: error.message });
        if (results.length === 0) return res.status(404).json({ message: "Pricing entry not found" });
        res.json(results[0]);
    });
});

app.put('/pricing/:id', (req, res) => {
    const { id } = req.params;
    const { name, description, price } = req.body;
    if (!name || !price) return res.status(400).json({ message: 'Name and price are required' });

    const query = 'UPDATE pricing SET name = ?, description = ?, price = ? WHERE id = ?';
    db.query(query, [name, description, price, id], (error, results) => {
        if (error) return res.status(500).json({ error: error.message });
        if (results.affectedRows === 0) return res.status(404).json({ message: 'Pricing entry not found' });
        res.json({ id, name, description, price });
    });
});

app.delete('/pricing/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM pricing WHERE id = ?';
    db.query(query, [id], (error, results) => {
        if (error) return res.status(500).json({ error: error.message });
        if (results.affectedRows === 0) return res.status(404).json({ message: 'Pricing entry not found' });
        res.status(204).send();
    });
});


//generate volunteer activity reports
app.get('/reports/volunteer-activity', async (req, res) => {
    const format = req.query.format; // 'pdf' or 'csv'
    const sql = `SELECT up.full_name, vh.participation, e.event_name, e.description, e.location, e.required_skills, e.urgency, e.event_date FROM volunteerhistory vh JOIN userprofile up ON vh.user_id = up.user_id JOIN eventdetails e ON vh.event_id = e.event_id ORDER BY up.full_name, e.event_date DESC`;

    db.query(sql, async (err, data) => {
        if (err) return res.status(500).json({ message: "Error fetching volunteer activity data" });
        if (format === 'csv') {
            generateCSVReport(data, res, 'volunteer_activity_report');
        } else if (format === 'pdf') {
            generatePDFReport(data, res, 'volunteer_activity_report', 'volunteer_activity_report_template.ejs');
        } else {
            res.status(400).json({ message: "Invalid format specified" });
        }
    });
});

//generate event management reports
app.get('/reports/event-management', async (req, res) => {
    const format = req.query.format; // 'pdf' or 'csv'
    const sql = `SELECT e.event_name, e.description, e.location, e.required_skills, e.urgency, e.event_date, up.full_name FROM eventdetails e LEFT JOIN volunteerhistory vh ON e.event_id = vh.event_id LEFT JOIN userprofile up ON vh.user_id = up.user_id ORDER BY e.event_date DESC`;

    db.query(sql, async (err, data) => {
        if (err) return res.status(500).json({ message: "Error fetching event management data" });
        if (format === 'csv') {
            generateCSVReport(data, res, 'event_management_report');
        } else if (format === 'pdf') {
            generatePDFReport(data, res, 'event_management_report', 'event_management_report_template.ejs');
        } else {
            res.status(400).json({ message: "Invalid format specified" });
        }
    });
});

const generateCSVReport = (data, res, fileName) => {
    try {
        const fields = Object.keys(data[0]);
        const parser = new Parser({ fields });
        const csv = parser.parse(data);

        res.header('Content-Type', 'text/csv');
        res.attachment(`${fileName}.csv`);
        return res.send(csv);
    } catch (error) {
        console.error("Error generating CSV report", error);
        res.status(500).json({ message: "Error generating CSV report" });
    }
};

const generatePDFReport = (data, res, fileName, template) => {
    ejs.renderFile(path.join(__dirname, 'templates', template), { data }, (err, html) => {
        if (err) {
            console.error("Error rendering EJS template", err);
            return res.status(500).json({ message: "Error rendering EJS template" });
        }

        const options = { format: 'A4' };
        pdf.create(html, options).toStream((err, stream) => {
            if (err) {
                console.error("Error creating PDF", err);
                return res.status(500).json({ message: "Error creating PDF" });
            }

            res.header('Content-Type', 'application/pdf');
            res.attachment(`${fileName}.pdf`);
            return stream.pipe(res);
        });
    });
};

app.listen(8081, () => {
    console.log("Server is running on port 8081...");
});