import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../database/db.js';
import { auth } from '../middleware/authMiddleware.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey12345!studentlearningplatform';

// REGISTER STUDENT
router.post('/register', (req, res) => {
  try {
    const { name, email, password, className, rollNo } = req.body;

    if (!name || !email || !password || !className || !rollNo) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if email already exists
    const existingUser = db.findOne('users', { email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = db.create('users', {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'student',
      class: className,
      rollNo,
      profilePhoto: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`
    });

    // Generate JWT
    const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        class: newUser.class,
        rollNo: newUser.rollNo,
        profilePhoto: newUser.profilePhoto
      }
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// LOGIN (Both Student and Admin)
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = db.findOne('users', { email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Check password
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        class: user.class,
        rollNo: user.rollNo,
        profilePhoto: user.profilePhoto
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// GET CURRENT USER PROFILE
router.get('/me', auth, (req, res) => {
  res.json({ user: req.user });
});

// PASSWORD RESET
router.post('/reset-password', (req, res) => {
  try {
    const { email, newPassword, role } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: "Email and new password are required." });
    }

    const user = db.findOne('users', { email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User with this email not found." });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ message: `Access denied. This email is not registered as a ${role}.` });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    db.update('users', { id: user.id }, { password: hashedPassword });

    res.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

export default router;
