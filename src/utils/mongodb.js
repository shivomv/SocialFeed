import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';

// Make sure MONGODB_URI is available
if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Default to local MongoDB if MONGODB_URI is not provided (should not happen due to check above)
const uri = process.env.MONGODB_URI;

// MongoDB connection options with improved reliability
const options = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
  retryWrites: true,
  retryReads: true,
};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect()
      .catch(err => {
        console.error('Failed to connect to MongoDB:', err);
        console.log('Make sure MongoDB is running locally or provide a valid MONGODB_URI in .env.local');
        throw err;
      });
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect()
    .catch(err => {
      console.error('Failed to connect to MongoDB in production:', err);
      // In production, we'll still throw but with a more generic message
      throw new Error('Unable to connect to database');
    });
}

// Connect to MongoDB using Mongoose with improved options
export async function connectToMongoose() {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  try {
    // Configure Mongoose for better production use
    mongoose.set('strictQuery', true);

    return await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });
  } catch (error) {
    console.error('Mongoose connection error:', error);
    throw new Error('Failed to connect to database with Mongoose');
  }
}

// Helper function to check if the database is connected
export async function checkDatabaseConnection() {
  try {
    const client = await clientPromise;
    await client.db().command({ ping: 1 });
    console.log('MongoDB connection successful!');
    return true;
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    return false;
  }
}

// Helper to gracefully close connections when the app is shutting down
export async function closeDbConnection() {
  try {
    await mongoose.connection.close();
    if (client) {
      await client.close();
    }
    console.log('Database connections closed');
  } catch (error) {
    console.error('Error closing database connections:', error);
  }
}

// Add event listeners for process termination to close DB connections
if (process.env.NODE_ENV === 'production') {
  process.on('SIGINT', async () => {
    await closeDbConnection();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await closeDbConnection();
    process.exit(0);
  });
}

export default clientPromise;
