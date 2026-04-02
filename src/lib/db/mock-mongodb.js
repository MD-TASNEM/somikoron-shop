// Mock database for development when MongoDB is not available
let mockUsers = [
  {
    _id: '1',
    email: 'admin@example.com',
    name: 'Admin User',
    password: '$2a$10$dummy.hash.for.admin.user', // This won't actually be checked
    role: 'admin'
  },
  {
    _id: '2', 
    email: 'user@example.com',
    name: 'Regular User',
    password: '$2a$10$dummy.hash.for.regular.user', // This won't actually be checked
    role: 'user'
  }
];

export async function getDb() {
  // Return a mock database object for development
  return {
    collection: (name) => ({
      findOne: async (query) => {
        if (name === 'users') {
          return mockUsers.find(user => user.email === query.email);
        }
        return null;
      },
      insertOne: async (doc) => {
        const newDoc = { ...doc, _id: Date.now().toString() };
        mockUsers.push(newDoc);
        return { insertedId: newDoc._id };
      },
      find: async () => ({
        toArray: async () => mockUsers
      })
    })
  };
}

export async function closeConnection() {
  // Mock function - does nothing
}
