# Social Feed App

A modern social media feed application built with Next.js 14 (App Router), MongoDB, and JWT authentication. This application allows users to sign up, log in, and post text and image content with Markdown support. All posts appear on the homepage in a news feed format, creating an interactive social experience.

![Social Feed App Screenshot](public/app-screenshot.png)

## Features

- **User Authentication**
  - Secure signup and login with JWT tokens
  - Protected routes for authenticated users
  - User profile information display
  - Session management

- **Content Creation**
  - Rich text editor with Markdown support
  - Image upload functionality
  - Real-time post creation and display
  - Support for formatting: bold, italic, headings, lists, and quotes

- **User Interface**
  - Modern, responsive design for all devices
  - Gradient UI elements with smooth transitions
  - Intuitive navigation with active state indicators
  - Dark mode support

- **User Dashboard**
  - Personal post management
  - Post history and statistics
  - User profile information
  - Personalized feed

## Technologies Used

### Frontend
- **Framework**: Next.js 14 with App Router
- **UI Library**: React 18
- **Styling**: TailwindCSS with custom gradients and animations
- **Form Handling**: React Hook Form with validation
- **State Management**: React Context API
- **Client-Side Routing**: Next.js App Router

### Backend
- **API Routes**: Next.js API Routes (serverless functions)
- **Authentication**: Custom JWT implementation with secure HTTP-only cookies
- **Data Validation**: Server-side validation for all inputs
- **File Handling**: Multipart form data processing

### Database & Storage
- **Database**: MongoDB with Mongoose ODM
- **Schema Design**: Mongoose schemas with relationships
- **File Storage**: Local file storage with optimization for production
- **Data Serialization**: Custom serialization for MongoDB objects

### Development & Deployment
- **Development**: Next.js development server with hot reloading
- **Deployment**: Vercel (optimized for Next.js)
- **Environment**: Environment variables for configuration
- **Version Control**: Git with GitHub

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB database (local or remote)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/social-feed-app.git
   cd social-feed-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/social-feed-app

   # JWT Configuration
   JWT_SECRET=your-secret-key-for-jwt-tokens

   # Application Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Deployment

### Deploying to Vercel

The easiest way to deploy this application is using Vercel, which is optimized for Next.js projects.

#### Option 1: Deploy directly from GitHub

1. Push your code to a GitHub repository
2. Go to [Vercel](https://vercel.com) and sign up or log in
3. Click "New Project" and import your GitHub repository
4. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: next build
   - Output Directory: .next
5. Add the following environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your secret key for JWT tokens
   - `NEXT_PUBLIC_APP_URL`: Your Vercel deployment URL (e.g., https://your-app.vercel.app)
6. Click "Deploy"

#### Option 2: Deploy using Vercel CLI

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Log in to your Vercel account:
   ```bash
   vercel login
   ```

3. Deploy the application:
   ```bash
   vercel
   ```

4. Follow the interactive prompts to configure your project
5. Add your environment variables when prompted or later in the Vercel dashboard

### MongoDB Atlas Configuration

For production deployment, it's recommended to use MongoDB Atlas:

1. Create a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
2. Create a new cluster
3. Set up a database user with appropriate permissions
4. Whitelist IP addresses (use 0.0.0.0/0 to allow access from anywhere)
5. Get your connection string and add it to your Vercel environment variables

### File Storage in Production

For production, consider using a cloud storage solution instead of local file storage:

1. Set up an AWS S3 bucket, Cloudinary, or similar service
2. Update the upload API route to use the cloud storage
3. Update environment variables accordingly

## Project Structure

- `/src/app`: Next.js app router pages
- `/src/components`: React components
- `/src/context`: React context providers
- `/src/utils`: Utility functions and database connections
- `/public`: Static assets

## License

This project is licensed under the MIT License.
