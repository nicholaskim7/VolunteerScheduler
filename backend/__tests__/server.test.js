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

    it('should handle invalid input for user creation', async () => {
        const response = await request(app)
            .post('/create')
            .send({
                email: 'invalid-email',
                password: 'short'
            });
    
        expect(response.statusCode).toBe(400); 
        expect(response.body.error).toBe('Missing required fields'); 
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

    it('should return an error if trying to fetch a profile with an invalid token', async () => {
        const response = await request(app)
            .get(`/user/${userId}`)
            .set('Cookie', [`token=invalidtoken`]);
    
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Token is not ok');
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

    it('should handle missing user ID in profile management', async () => {
        const response = await request(app)
            .put(`/profile-management/`)
            .set('Cookie', [`token=${token}`])
            .send({
                name: 'Missing UserID'
            });
    
        expect(response.statusCode).toBe(404); 
        expect(response.body.message).toBeUndefined();
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
            .put(`/volunteers/match/${87}`)
            .send({ event_id: 14, participation: 'Interested' });
    
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Volunteer matched and notified successfully');
    });
    
    it('should get all events', async () => {
        const response = await request(app).get('/events');
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeInstanceOf(Array);  
    });
    
    it('should create a new event', async () => {
        const response = await request(app)
            .post('/events/create') 
            .send({
                name: 'New Event',
                description: 'New Description',
                location: 'Location 1',
                requiredSkills: ['Skill 1', 'Skill 2'],
                urgency: 'High',
                date: '2024-08-08' 
            });
    
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Created new event"); 
    });
    
    it('should update an event', async () => {
        const response = await request(app)
            .put(`/events/update/${45}`) 
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
            .delete(`/events/${45}`); 
    
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeInstanceOf(Object);  
    });
    
    it('should retrieve all volunteers', async () => {
        const response = await request(app).get('/volunteers');
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeInstanceOf(Array);  
    });
    
    it('should retrieve notifications', async () => {
        const response = await request(app).get('/notifications').query({ userId });
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeInstanceOf(Array);  
    });

    it('should delete the notification successfully', async () => {
        const response = await request(app)
            .delete(`/notifications/${244}`)
            .set('Cookie', [`token=${token}`])
            .query({ userId });

        expect(response.statusCode).toBe(204);
    });
    
    it('should retrieve volunteer history', async () => {
        const response = await request(app).get(`/volunteerHistory`).query({ user_id: 45 });
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    });

    it('should generate a CSV report for volunteer activity', async () => {
        const response = await request(app)
            .get('/reports/volunteer-activity')
            .query({ format: 'csv' });

        expect(response.statusCode).toBe(200);
        expect(response.headers['content-type']).toBe('text/csv; charset=utf-8');
        expect(response.headers['content-disposition']).toContain('attachment; filename="volunteer_activity_report.csv"');
        expect(response.text).toContain('"full_name","participation","event_name"');
    });

    it('should generate a PDF report for volunteer activity', async () => {
        const response = await request(app)
            .get('/reports/volunteer-activity')
            .query({ format: 'pdf' });

        expect(response.statusCode).toBe(200);
        expect(response.headers['content-type']).toBe('application/pdf');
        expect(response.headers['content-disposition']).toContain('attachment; filename="volunteer_activity_report.pdf"');
    });

    it('should generate a CSV report for event management', async () => {
        const response = await request(app)
            .get('/reports/event-management')
            .query({ format: 'csv' });

        expect(response.statusCode).toBe(200);
        expect(response.headers['content-type']).toBe('text/csv; charset=utf-8');
        expect(response.headers['content-disposition']).toContain('attachment; filename="event_management_report.csv"');
        expect(response.text).toContain('"event_name","description","location"');
    });

    it('should generate a PDF report for event management', async () => {
        const response = await request(app)
            .get('/reports/event-management')
            .query({ format: 'pdf' });

        expect(response.statusCode).toBe(200);
        expect(response.headers['content-type']).toBe('application/pdf');
        expect(response.headers['content-disposition']).toContain('attachment; filename="event_management_report.pdf"');
    });

    

    it('should return a 400 error for an invalid format', async () => {
        const response = await request(app)
            .get('/reports/volunteer-activity')
            .query({ format: 'invalid' })
            .set('Cookie', [`token=${token}`]);

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Invalid format specified');
    });


    it('should return a 400 error for an invalid format', async () => {
        const response = await request(app)
            .get('/reports/event-management')
            .query({ format: 'invalid' })
            .set('Cookie', [`token=${token}`]);

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Invalid format specified');
    });
    
});
