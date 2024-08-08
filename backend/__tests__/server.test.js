const request = require('supertest');
const express = require('express');
const app = require('../server.js'); // Adjust the path as needed

describe('API Endpoints', () => {

    // Test for the GET / route
    test('GET / should return all user profiles', async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    });

    // Test for the POST /login route
    test('POST /login should authenticate user and return a token', async () => {
        const response = await request(app)
            .post('/login')
            .send({ email: 'jdoe12@gmail.com', password: 'john' });
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('token');
    });

    // Test for the POST /create route
    test('POST /create should create a new user', async () => {
        const response = await request(app)
            .post('/create')
            .send({ name: 'sarah', email: 'sarah@example.com', password: 'sarah123' });
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('userId');
    });

    // Test for the GET /user/:id route
    test('GET /user/:id should return user profile and credentials', async () => {
        const userId = 1; // Replace with a valid user ID
        const tokenResponse = await request(app)
            .post('/login') // Assuming you need to get a token
            .send({ email: 'existing@example.com', password: 'password123' }); // Update with valid credentials
        const token = tokenResponse.body.token;
    
        const response = await request(app)
            .get(`/user/${userId}`)
            .set('Authorization', `Bearer ${token}`); // Adjust header as needed
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('user');
    });

    // Test for the PUT /user/:id/update route
    test('PUT /user/:id/update should update user profile', async () => {
        const userId = 1; // Replace with a valid user ID from your database
        const response = await request(app)
            .put(`/user/${userId}/update`)
            .send({ full_name: 'Jane Doe', username: 'janedoe' });
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('message', 'User profile updated successfully');
    });

    // Test for the DELETE /user/:id route
    test('DELETE /user/:id should delete a user', async () => {
        const userId = 1; // Replace with a valid user ID
        const response = await request(app)
            .delete(`/user/${userId}`)
            .set('Authorization', `Bearer ${token}`); // Use a valid token if required
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('message', 'User deleted successfully');
    });

    // Test for the GET /events route
    test('GET /events should return all events', async () => {
        const response = await request(app).get('/events');
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    });

    // Test for the POST /events/create route
    test('POST /events/create should create a new event', async () => {
        const response = await request(app)
            .post('/events/create')
            .send({ name: 'New Event', description: 'Event Description', location: 'Event Location', requiredSkills: [], urgency: 'High', date: '2024-08-01' });
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('insertId');
    });

    // Test for the PUT /events/update/:event_id route
    test('PUT /events/update/:event_id should update an event', async () => {
        const eventId = 1; // Replace with a valid event ID from your database
        const response = await request(app)
            .put(`/events/update/${eventId}`)
            .send({ name: 'Updated Event', description: 'Updated Description', location: 'Updated Location', requiredSkills: [], urgency: 'Low', date: '2024-08-15' });
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('message', 'Event updated and volunteers notified successfully');
    });

    // Test for the DELETE /events/:event_id route
    test('DELETE /events/:event_id should delete an event', async () => {
        const eventId = 1; // Replace with a valid event ID
        const response = await request(app)
            .delete(`/events/${eventId}`)
            .set('Authorization', `Bearer ${token}`); // Use a valid token if required
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('message', 'Event deleted successfully');
    });

    // Test for the GET /notifications route
    test('GET /notifications should return notifications for a user', async () => {
        const userId = 1; // Replace with a valid user ID from your database
        const response = await request(app)
            .get('/notifications')
            .query({ userId });
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    });

    // Test for the DELETE /notifications/:id route
    test('DELETE /notifications/:id should delete a notification', async () => {
        const userId = 1; // Replace with a valid user ID from your database
        const notificationId = 1; // Replace with a valid notification ID from your database
        const response = await request(app)
            .delete(`/notifications/${notificationId}`)
            .query({ userId });
        expect(response.statusCode).toBe(204);
    });

    // Test for the GET /volunteerHistory route
    test('GET /volunteerHistory should return volunteer history for a user', async () => {
        const userId = 1; // Replace with a valid user ID from your database
        const response = await request(app)
            .get('/volunteerHistory')
            .query({ user_id: userId });
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    });

    // Test for the GET /reports/volunteer-activity route
    test('GET /reports/volunteer-activity should generate a volunteer activity report', async () => {
        const response = await request(app)
            .get('/reports/volunteer-activity')
            .query({ format: 'csv' }); // Change format to 'pdf' to test PDF generation
        expect(response.statusCode).toBe(200);
    });

    // Test for the GET /reports/event-management route
    test('GET /reports/event-management should generate an event management report', async () => {
        const response = await request(app)
            .get('/reports/event-management')
            .query({ format: 'csv' }); // Change format to 'pdf' to test PDF generation
        expect(response.statusCode).toBe(200);
    });

});