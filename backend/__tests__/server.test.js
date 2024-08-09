const express = require("express");
const request = require('supertest');
const app = require('../server');
const cors = require('cors');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const cookieParser = require('cookie-parser');

const salt = 10;


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

//Testing
describe('API Endpoints', () => {
    let token;
    let userId;

    it('should create a new user', async () => {
        const response = await request(app)
            .post('/create')
            .send({
                name: 'newest user',
                email: 'newest@example.com',
                password: 'password123'
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe('User created successfully...');
        userId = response.body.userId;
    });

    it('should login the user and return a token', async () => {
        const response = await request(app)
            .post('/login')
            .send({
                email: 'newest@example.com',
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
        expect(response.body.user.full_name).toBe('newest user');
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
        expect(response.body.message).toBe('profile managed successfully');
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

    it('should match volunteer', async () => {
        const res = await request(app)
            .put(`/volunteers/match/${45}`)
            .send({ event_id: 14, participation: 'Interested' });
    
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Volunteer matched and notified successfully');
    });
    
    it('should get all events', async () => {
        const response = await request(app).get('/events');
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeInstanceOf(Array);  // Assuming it returns an array of events
    });
    
    it('should create a new event', async () => {
        const response = await request(app)
            .post('/events/create') // Changed from GET to POST
            .send({
                name: 'New Event',
                description: 'New Description',
                location: 'Location 1',
                requiredSkills: ['Skill 1', 'Skill 2'],
                urgency: 'High',
                date: '2024-08-08' 
            });
    
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Created new event"); // Adjust to match the actual response
    });
    
    it('should update an event', async () => {
        const response = await request(app)
            .put(`/events/update/${45}`) // Ensure eventId is defined with an actual ID
            .send({
                name: 'Updated Event',
                description: 'Updated Description',
                location: 'Updated Location',
                requiredSkills: ['Skill 3', 'Skill 4'],
                urgency: 'Low',
                date: '2024-08-09' 
            });
    
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Event updated and volunteers notified successfully');
    });
    
    it('should delete an event', async () => {
        const response = await request(app)
            .delete(`/events/${45}`); // Ensure eventId is defined with an actual ID
    
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeInstanceOf(Object);  // Adjust based on actual server response
    });
    
    it('should retrieve all volunteers', async () => {
        const response = await request(app).get('/volunteers');
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeInstanceOf(Array);  // Assuming it returns an array of volunteers
    });
    
    it('should retrieve notifications', async () => {
        const response = await request(app).get('/notifications').query({ userId });
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeInstanceOf(Array);  // Assuming it returns an array of notifications
    });
    
    it('should retrieve volunteer history', async () => {
        const response = await request(app).get(`/volunteerHistory`).query({ user_id: 45 });
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeInstanceOf(Array);  // Assuming it returns an array of volunteer history
    });
});

