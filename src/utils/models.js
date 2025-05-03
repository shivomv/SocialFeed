import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectToMongoose } from './mongodb';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// User Schema
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
  },
  profileImage: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  sessions: [{
    token: String,
    expiresAt: Date
  }]
});

// Post Schema
const PostSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
  },
  imageUrl: {
    type: String,
    default: '',
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// File Schema for storing uploaded files
const FileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  mimetype: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate auth token
UserSchema.methods.generateAuthToken = function() {
  const token = jwt.sign(
    { id: this._id, email: this.email },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );

  // Store token in user's sessions
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  this.sessions.push({
    token,
    expiresAt
  });

  return token;
};

// Initialize models
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);
export const File = mongoose.models.File || mongoose.model('File', FileSchema);

// Connect to MongoDB
export async function connectToDatabase() {
  try {
    await connectToMongoose();
    return true;
  } catch (error) {
    console.error('Failed to connect to database:', error);
    return false;
  }
}

// Authentication functions
export async function registerUser(userData) {
  await connectToDatabase();

  // Check if user already exists
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Create new user
  const user = new User(userData);
  await user.save();

  // Generate token
  const token = user.generateAuthToken();
  await user.save(); // Save again to store the session

  return { user, token };
}

export async function loginUser(email, password) {
  await connectToDatabase();

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  // Generate token
  const token = user.generateAuthToken();
  await user.save(); // Save to store the session

  return { user, token };
}

export async function logoutUser(userId, token) {
  await connectToDatabase();

  // Find user and remove the session with the given token
  await User.updateOne(
    { _id: userId },
    { $pull: { sessions: { token } } }
  );

  return true;
}

export async function verifyToken(token) {
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Find user with this token in their sessions
    const user = await User.findOne({
      _id: decoded.id,
      'sessions.token': token,
      'sessions.expiresAt': { $gt: new Date() }
    });

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
}

// Helper functions for database operations
export async function findUserByEmail(email) {
  await connectToDatabase();
  return User.findOne({ email });
}

export async function findUserById(id) {
  await connectToDatabase();
  return User.findById(id);
}

export async function getAllPosts() {
  try {
    await connectToDatabase();
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('author', 'fullName email profileImage')
      .lean(); // Convert to plain JavaScript objects

    // Properly serialize MongoDB objects
    return Array.isArray(posts)
      ? posts.map(post => ({
          id: post._id.toString(),
          content: post.content,
          imageUrl: post.imageUrl,
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString(),
          author: post.author ? {
            id: post.author._id.toString(),
            fullName: post.author.fullName,
            email: post.author.email,
            profileImage: post.author.profileImage
          } : null,
          likes: post.likes ? post.likes.map(like => like.toString()) : []
        }))
      : [];
  } catch (error) {
    console.error('Error in getAllPosts:', error);
    return [];
  }
}

export async function getPostsByUser(userId) {
  try {
    await connectToDatabase();
    const posts = await Post.find({ author: userId })
      .sort({ createdAt: -1 })
      .populate('author', 'fullName email profileImage')
      .lean(); // Convert to plain JavaScript objects

    // Properly serialize MongoDB objects
    return Array.isArray(posts)
      ? posts.map(post => ({
          id: post._id.toString(),
          content: post.content,
          imageUrl: post.imageUrl,
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString(),
          author: post.author ? {
            id: post.author._id.toString(),
            fullName: post.author.fullName,
            email: post.author.email,
            profileImage: post.author.profileImage
          } : null,
          likes: post.likes ? post.likes.map(like => like.toString()) : []
        }))
      : [];
  } catch (error) {
    console.error('Error in getPostsByUser:', error);
    return [];
  }
}

export async function createPost(postData) {
  try {
    await connectToDatabase();
    return await Post.create(postData);
  } catch (error) {
    console.error('Error in createPost:', error);
    throw error; // Re-throw to allow proper error handling in the API route
  }
}

export async function uploadFile(fileData) {
  try {
    await connectToDatabase();
    return await File.create(fileData);
  } catch (error) {
    console.error('Error in uploadFile:', error);
    throw error; // Re-throw to allow proper error handling in the API route
  }
}
