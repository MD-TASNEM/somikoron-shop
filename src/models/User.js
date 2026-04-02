import { Db, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

;
  phone?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

;
  phone?: string;
}

;
  phone?: string;
}

export class UserService {
  db: Db;
  collectionName = 'users';

  constructor(db) {
    this.db = db;
  }

  // Create indexes for better performance
  async createIndexes() {
    const collection = this.db.collection(this.collectionName);
    await collection.createIndex({ email: 1 }, { unique);
    await collection.createIndex({ role: 1 });
    await collection.createIndex({ createdAt: -1 });
  }

  // Hash password
  async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Verify password
  async verifyPassword(password) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Create a new user
  async create(userData) {
    const collection = this.db.collection(this.collectionName);
    const now = new Date();

    // Check if user already exists
    const existingUser = await collection.findOne({ email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await this.hashPassword(userData.password);

    const user, '_id' | 'id'> = {
      ...userData,
      password,
      role: userData.role || 'user',
      createdAt,
      updatedAt: now
    };

    const result = await collection.insertOne(user);
    const createdUser = await this.findById(result.insertedId);

    if (!createdUser) {
      throw new Error('Failed to create user');
    }

    // Remove password from returned user
    const userWithoutPassword = { ...createdUser };
    delete userWithoutPassword.password;
    return userWithoutPassword;
  }

  // Find user by ID
  async findById(id) {
    const collection = this.db.collection(this.collectionName);
    const _id = typeof id === 'string' ? new ObjectId(id) : id;

    const user = await collection.findOne({ _id });
    return user ? this.transformUser(user) : null;
  }

  // Find user by email
  async findByEmail(email) {
    const collection = this.db.collection(this.collectionName);

    const user = await collection.findOne({ email });
    return user ? this.transformUser(user) : null;
  }

  // Find user by email with password (for authentication)
  async findByEmailWithPassword(email) {
    const collection = this.db.collection(this.collectionName);

    const user = await collection.findOne({ email });
    return user ? this.transformUser(user) : null;
  }

  // Get all users with optional filtering
  async findAll(options: {
    page?: number;
    limit?: number;
    role?: 'user' | 'admin';
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    users: User[];
    total: number;
    page: number;
    pages: number;
  }> {
    const {
      page = 1,
      limit = 20,
      role,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    const collection = this.db.collection(this.collectionName);
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};

    if (role) {
      filter.role = role;
    }

    if (search) {
      filter.$or = [
        { name: { $regex, $options: 'i' } },
        { email: { $regex, $options: 'i' } }
      ];
    }

    // Build sort
    const sort, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute queries
    const users = await collection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await collection.countDocuments(filter);

    return {
      users: users.map(u => this.transformUser(u)),
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  // Update a user
  async update(id) {
    const collection = this.db.collection(this.collectionName);
    const _id = typeof id === 'string' ? new ObjectId(id) : id;

    const updateDoc = {
      $set: {
        ...updateData,
        updatedAt: new Date()
      }
    } as { $set: Record };

    // Hash password if it's being updated
    if (updateData.password) {
      (updateDoc.$set).password = await this.hashPassword(updateData.password);
    }

    const result = await collection.updateOne({ _id }, updateDoc);

    if (result.matchedCount === 0) {
      return null;
    }

    const updatedUser = await this.findById(_id);
    return updatedUser;
  }

  // Delete a user
  async delete(id) {
    const collection = this.db.collection(this.collectionName);
    const _id = typeof id === 'string' ? new ObjectId(id) : id;

    const result = await collection.deleteOne({ _id });
    return result.deletedCount > 0;
  }

  // Update user role
  async updateRole(id, role: 'user' | 'admin') {
    return this.update(id, { role });
  }

  // Change password
  async changePassword(id) {
    const collection = this.db.collection(this.collectionName);
    const _id = typeof id === 'string' ? new ObjectId(id) : id;

    const hashedPassword = await this.hashPassword(newPassword);

    const result = await collection.updateOne(
      { _id },
      {
        $set: {
          password,
          updatedAt: new Date()
        }
      }
    );

    return result.matchedCount > 0;
  }

  // Get user count by role
  async getUserCountByRole() { users: number; admins: number }> {
    const collection = this.db.collection(this.collectionName);

    const userCount = await collection.countDocuments({ role: 'user' });
    const adminCount = await collection.countDocuments({ role: 'admin' });

    return {
      users,
      admins: adminCount
    };
  }

  // Search users
  async search(query, options: {
    page?: number;
    limit?: number;
    role?: 'user' | 'admin';
  } = {}) {
    users: User[];
    total: number;
    page: number;
    pages: number;
  }> {
    return this.findAll({
      ...options,
      search);
  }

  // Transform user data to include id field and remove password
  transformUser(user) {
    const userObj = user; password?: string };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = userObj;
    return {
      ...userWithoutPassword,
      id: userObj._id.toString()
    };
  }
}
