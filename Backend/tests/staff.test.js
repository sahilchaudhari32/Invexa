const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../src/app');
const User = require('../src/models/User');
const Warehouse = require('../src/models/Warehouse');
const { signToken } = require('../src/middleware/auth');

let mongod;
let managerToken;
let staffToken;
let testWarehouse;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  await User.init();
  await Warehouse.init();
}, 120000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
});

beforeEach(async () => {
  await User.deleteMany({});
  await Warehouse.deleteMany({});

  testWarehouse = await Warehouse.create({
    name: 'North Logistics Hub',
    code: 'NLH-01',
    active: true,
  });

  const manager = await User.create({
    name: 'Inventory Manager',
    fullName: 'Inventory Manager',
    email: 'manager@invexa.test',
    passwordHash: 'hashed123',
    role: 'manager',
    active: true,
  });
  managerToken = signToken(manager);

  const staff = await User.create({
    name: 'Warehouse Operator',
    fullName: 'Warehouse Operator',
    email: 'staff@invexa.test',
    passwordHash: 'hashed123',
    role: 'staff',
    active: true,
  });
  staffToken = signToken(staff);
});

describe('Staff Management API Suite', () => {
  test('Manager can list staff members', async () => {
    const res = await request(app)
      .get('/api/staff')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.length).toBe(2);
  });

  test('Manager can create a new staff operator', async () => {
    const payload = {
      fullName: 'Vikram Mehta',
      email: 'vikram.m@invexa.test',
      phone: '+91 98765 11223',
      role: 'Warehouse Staff',
      warehouseId: testWarehouse._id.toString(),
      department: 'Receiving Dock & Staging',
      shift: 'Morning Shift (06:00 - 14:00)',
      status: 'Active',
    };

    const res = await request(app)
      .post('/api/staff')
      .set('Authorization', `Bearer ${managerToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.data.fullName).toBe('Vikram Mehta');
    expect(res.body.data.warehouseName).toBe('North Logistics Hub');
  });

  test('Staff cannot create new staff members (403 Forbidden)', async () => {
    const payload = {
      fullName: 'Unauthorized Staff',
      email: 'unauth@invexa.test',
    };

    const res = await request(app)
      .post('/api/staff')
      .set('Authorization', `Bearer ${staffToken}`)
      .send(payload);

    expect(res.status).toBe(403);
  });

  test('Manager can update staff details', async () => {
    const created = await User.create({
      name: 'Rohan Sharma',
      fullName: 'Rohan Sharma',
      email: 'rohan@invexa.test',
      passwordHash: 'hash123',
      role: 'staff',
      department: 'Logistics',
      active: true,
    });

    const res = await request(app)
      .put(`/api/staff/${created._id}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        fullName: 'Rohan Sharma (Senior)',
        department: 'Inventory Quality Control',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.fullName).toBe('Rohan Sharma (Senior)');
    expect(res.body.data.department).toBe('Inventory Quality Control');
  });

  test('Manager can toggle staff status and deactivate staff', async () => {
    const created = await User.create({
      name: 'Aakash Patel',
      fullName: 'Aakash Patel',
      email: 'aakash@invexa.test',
      passwordHash: 'hash123',
      role: 'staff',
      status: 'Active',
      active: true,
    });

    // Toggle status
    const toggleRes = await request(app)
      .patch(`/api/staff/${created._id}/toggle-status`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect(toggleRes.status).toBe(200);
    expect(toggleRes.body.data.status).toBe('On Leave');

    // Delete (deactivate)
    const delRes = await request(app)
      .delete(`/api/staff/${created._id}`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect(delRes.status).toBe(200);

    const inDb = await User.findById(created._id);
    expect(inDb.active).toBe(false);
  });
});
