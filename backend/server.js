import express from 'express';
import cors from 'cors';
import path from 'url';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pathModule from 'path';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.js';
import quizRoutes from './routes/quizzes.js';
import paperRoutes from './routes/papers.js';
import notesRoutes from './routes/notes.js';
import resultsRoutes from './routes/results.js';
import studentRoutes from './routes/students.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Resolve paths for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = pathModule.dirname(__filename);

// Initialize folders if not exist
const folders = ['./uploads', './uploads/papers', './uploads/notes', './uploads/submissions', './data'];
folders.forEach(f => {
  if (!fs.existsSync(f)) {
    fs.mkdirSync(f, { recursive: true });
  }
});

// Middlewares
app.use(cors({
  origin: '*', // Allow all origins for testing
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files
app.use('/uploads', express.static(pathModule.join(__dirname, 'uploads')));

// Routes Middleware
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/papers', paperRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/students', studentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Catch-all route handler for unsupported requests
app.use((req, res, next) => {
  res.status(404).json({ message: "API Endpoint not found." });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "An unexpected error occurred on the server." });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
