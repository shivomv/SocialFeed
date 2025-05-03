import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';

// Default to local MongoDB if MONGODB_URI is not provided
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/social-feed-app';
const options = {};

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
  clientPromise = client.connect();
}

// Connect to MongoDB using Mongoose
export async function connectToMongoose() {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  return mongoose.connect(uri);
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

export default clientPromise;
