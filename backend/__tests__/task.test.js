const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const supertest = require('supertest');
const { app } = require('../server');

let mongoServer;
let authToken;
let testTaskId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Create a test user and get auth token
  const request = supertest(app);
  const res = await request.post('/api/auth/signup').send({
    name: 'Task Tester',
    email: 'tasks@example.com',
    password: 'password123',
  });
  authToken = res.body.data.accessToken;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

const request = supertest(app);

describe('Task Endpoints', () => {
  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const res = await request
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task',
          description: 'A test task description',
          priority: 'high',
          category: 'Work',
          dueDate: new Date(Date.now() + 86400000).toISOString(),
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.task.title).toBe('Test Task');
      expect(res.body.data.task.priority).toBe('high');
      testTaskId = res.body.data.task._id;
    });

    it('should reject task without title', async () => {
      const res = await request
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'No title' });

      expect(res.status).toBe(400);
    });

    it('should reject unauthorized requests', async () => {
      const res = await request.post('/api/tasks').send({ title: 'No auth' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/tasks', () => {
    it('should list user tasks', async () => {
      const res = await request
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.tasks)).toBe(true);
      expect(res.body.data.pagination).toBeDefined();
    });

    it('should filter by priority', async () => {
      const res = await request
        .get('/api/tasks?priority=high')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      res.body.data.tasks.forEach((task) => {
        expect(task.priority).toBe('high');
      });
    });

    it('should search tasks', async () => {
      const res = await request
        .get('/api/tasks?search=Test')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.tasks.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should get a single task', async () => {
      const res = await request
        .get(`/api/tasks/${testTaskId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.task._id).toBe(testTaskId);
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request
        .get(`/api/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update a task', async () => {
      const res = await request
        .put(`/api/tasks/${testTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated Task', completed: true });

      expect(res.status).toBe(200);
      expect(res.body.data.task.title).toBe('Updated Task');
      expect(res.body.data.task.completed).toBe(true);
    });
  });

  describe('GET /api/tasks/stats', () => {
    it('should return dashboard stats', async () => {
      const res = await request
        .get('/api/tasks/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('pending');
      expect(res.body.data).toHaveProperty('completed');
      expect(res.body.data).toHaveProperty('total');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
      const res = await request
        .delete(`/api/tasks/${testTaskId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for already deleted task', async () => {
      const res = await request
        .delete(`/api/tasks/${testTaskId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });
});
