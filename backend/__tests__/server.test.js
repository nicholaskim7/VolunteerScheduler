const express = require('express');
const request = require('supertest');
const cors = require('cors');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const cookieParser = require('cookie-parser');

const salt = 10;

const app = express();
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173"],
    methods: ["POST", "GET", 'PUT', 'DELETE'],
    credentials: true
}));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const dbConfig = {
    host: "localhost",
    user: "root",
    password: "",
    database: "volunteer_management"
};

let db;
beforeAll(async () => {
    db = await mysql.createConnection(dbConfig);
});

afterAll(async () => {
    await db.end();
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });


const verifyUser = (req, res, next) => { //once user is loggedin we verify by checking if we have the corect token or not
    const token = req.cookies.token;
    if (!token) {
        return res.json({ message: "You are not Authorized" });
    } else {
        jwt.verify(token, "secret_key_123", (err, decoded) => {
            if (err) {
                return res.json({ message: "Token is not ok" });
            } else {
                req.userId = decoded.userId;
                next();
            }
        });
    }
};


//gets all users from database
app.get("/", async (req, res) => {
    const sql = "SELECT * FROM userprofile";
    try {
        const [data] = await db.query(sql);
        return res.json(data);
    } catch (err) {
        return res.json("Error");
    }
});


//login logic select user whose email and password matches (added hashing of password)
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM usercredentials WHERE email = ?";
    
    try {
        const [data] = await db.query(sql, [email]);
        if (data.length > 0) {
            const hashedPassword = data[0].password;
            bcrypt.compare(password.toString(), hashedPassword, (err, response) => {
                if (err) return res.json({ message: "Password compare error" });
                if (response) {
                    const userId = data[0].user_id;
                    const token = jwt.sign({ userId }, "secret_key_123", { expiresIn: '1d' });
                    res.cookie('token', token);
                    return res.json({ message: "Login successful...", userId });
                } else {
                    return res.json({ message: "Password not matched" });
                }
            });
        } else {
            return res.status(401).json({ message: "Login Error. Please try again. If you don't have an account please create one." });
        }
    } catch (err) {
        return res.status(500).json({ message: "Login Error" });
    }
});


//creating new users and inserting into the database (hashing password implemented)
app.post('/create', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        await db.beginTransaction();

        const userProfileSql = "INSERT INTO userprofile (`full_name`) VALUES (?)";
        const userCredentialsSql = "INSERT INTO usercredentials (`user_id`, `email`, `password`) VALUES (?, ?, ?)";

        const hash = await bcrypt.hash(password.toString(), salt);

        const [profileResult] = await db.query(userProfileSql, [name]);
        const userId = profileResult.insertId;

        await db.query(userCredentialsSql, [userId, email, hash]);

        await db.commit();
        res.json({ message: "User created successfully...", userId });
    } catch (err) {
        await db.rollback();
        res.json({ message: "Error creating user" });
    }
});


//once user is logged in they are redirected to there profile page
app.get('/user/:id', verifyUser, async (req, res) => {
    const { id } = req.params;
    const sqlProfile = "SELECT user_id, full_name, username, profile_picture, address1, address2, city, state, zipcode, skills, preferences, availability FROM userprofile WHERE user_id = ?";
    const sqlCredentials = "SELECT email FROM usercredentials WHERE user_id = ?";

    try {
        const [profileData] = await db.query(sqlProfile, [id]);
        if (profileData.length > 0) {
            const [credentialsData] = await db.query(sqlCredentials, [id]);
            if (credentialsData.length > 0) {
                return res.json({ Status: "Success", user: { ...profileData[0], ...credentialsData[0] } });
            } else {
                return res.status(404).json({ message: "Credentials not found" });
            }
        } else {
            return res.status(404).json({ message: "User profile not found" });
        }
    } catch (err) {
        return res.status(500).json({ message: "Error fetching user profile" });
    }
});

//update user profile
app.put('/user/:id/update', upload.single('profile_picture'), async (req, res) => {
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

    try {
        await db.query(sql, params);
        res.json({ message: "User profile updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error updating user profile" });
    }
});


//update user credentials
app.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { email, password } = req.body;

    let sql = "UPDATE usercredentials SET email = ?";
    let params = [email];

    if (password) {
        try {
            const hash = await bcrypt.hash(password.toString(), salt);
            sql += ", password = ?";
            params.push(hash);
        } catch (err) {
            return res.status(500).json({ message: "Error hashing password" });
        }
    }
    
    sql += " WHERE user_id = ?";
    params.push(id);

    try {
        await db.query(sql, params);
        res.json({ message: "User credentials updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error updating user credentials" });
    }
});


//clear cookies so now when you refresh you will no longer be authenticated. (this fixes bypassing login thru url)
app.get('/user/:id/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ status: "Success" });
});


//update profile management info
app.put('/profile-management/:id', async (req, res) => {
    const { id } = req.params;
    const { name, address1, address2, city, state, zipcode, skills, preferences, availability } = req.body;
    const sql = "UPDATE userprofile SET `full_name` = ?, `address1` = ?, `address2` = ?, `city` = ?, `state` = ?, `zipcode` = ?, `skills` = ?, `preferences` = ?, `availability` = ? WHERE user_id = ?";
    
    try {
        await db.query(sql, [name, address1, address2, city, state, zipcode, JSON.stringify(skills), preferences, JSON.stringify(availability), id]);
        res.json({ message: "Profile managed successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error updating profile management" });
    }
});


//logic to remove user (need to delete from both tables since split into two different tables)
app.delete('/user/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await db.beginTransaction();

        const deleteProfileSql = "DELETE FROM userprofile WHERE user_id = ?";
        const deleteCredentialsSql = "DELETE FROM usercredentials WHERE user_id = ?";

        await db.query(deleteProfileSql, [id]);
        await db.query(deleteCredentialsSql, [id]);

        await db.commit();
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        await db.rollback();
        res.status(500).json({ message: "Error deleting user" });
    }
});



//Testing
describe('API Endpoints', () => {
    let token;
    let userId;

    it('should create a new user', async () => {
        const response = await request(app)
            .post('/create')
            .send({
                name: 'Test User',
                email: 'testuser@example.com',
                password: 'password123'
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('User created successfully...');
        userId = response.body.userId;
    });

    it('should login the user and return a token', async () => {
        const response = await request(app)
            .post('/login')
            .send({
                email: 'testuser@example.com',
                password: 'password123'
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Login successful...');
        token = response.headers['set-cookie'][0].split(';')[0].split('=')[1];
    });

    it('should fetch all users', async () => {
        const response = await request(app)
            .get('/');

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it('should fetch user profile with valid token', async () => {
        const response = await request(app)
            .get(`/user/${userId}`)
            .set('Cookie', [`token=${token}`]);

        expect(response.statusCode).toBe(200);
        expect(response.body.Status).toBe('Success');
        expect(response.body.user.full_name).toBe('Test User');
    });

    it('should update user profile', async () => {
        const response = await request(app)
            .put(`/user/${userId}/update`)
            .set('Cookie', [`token=${token}`])
            .send({
                full_name: 'Updated User',
                username: 'updateduser'
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('User profile updated successfully');
    });

    it('should update user credentials', async () => {
        const response = await request(app)
            .put(`/update/${userId}`)
            .send({
                email: 'updateduser@example.com',
                password: 'newpassword123'
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('User credentials updated successfully');
    });

    it('should update user profile management information', async () => {
        const response = await request(app)
            .put(`/profile-management/${userId}`)
            .set('Cookie', [`token=${token}`])
            .send({
                name: 'Updated Name',
                address1: 'New Address 1',
                address2: 'New Address 2',
                city: 'New City',
                state: 'New State',
                zipcode: '12345',
                skills: ['JavaScript', 'Node.js'],
                preferences: 'Updated preferences',
                availability: ['Monday', 'Wednesday']
            });
    
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Profile managed successfully');
    });

    it('should logout the user', async () => {
        const response = await request(app)
            .get(`/user/${userId}/logout`)
            .set('Cookie', [`token=${token}`]);

        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe('Success');
    });

    it('should delete the user', async () => {
        const response = await request(app)
            .delete(`/user/${userId}`)
            .set('Cookie', [`token=${token}`]);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('User deleted successfully');
    });
});