const admin = require("firebase-admin");

// Mock the admin initialization
jest.mock('firebase-admin', () => {
  const mockAuth = {
    createUser: jest.fn(() => Promise.resolve({ uid: '12345' })),
  };
  return {
    initializeApp: jest.fn(),
    credential: {
      cert: jest.fn(),
    },
    auth: jest.fn(() => mockAuth),
  };
});

describe('Firebase Admin Authentication', () => {
  test('creates a new user', async () => {
    const user = await admin.auth().createUser();
    expect(user.uid).toBe('12345');
  });
});
