import express from 'express';
import User from '../models/user.js';
import Message from '../models/messages.js';

const router = express.Router();

// GET user by ID
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST - create a new user
router.post('/users', async (req, res) => {
  try {
    console.log('Creating new user with data:', req.body);
    
    // Check if language is provided
    if (!req.body.language) {
      return res.status(400).json({ message: 'Language is required' });
    }
    
    // Create a new user
    const newUser = new User({
      language: req.body.language,
      name: req.body.name || 'website-visitor',
      email: req.body.email || '',
    });
    
    // Save the user to the database
    const savedUser = await newUser.save();
    console.log('User created successfully with ID:', savedUser._id);
    
    res.status(201).json(savedUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(400).json({ message: error.message });
  }
});

// GET all users (for admin purposes)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: error.message });
  }
});

// UPDATE user
router.put('/users/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        lastActive: new Date() // Update last active timestamp
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(400).json({ message: error.message });
  }
});

// GET all messages for a specific user
router.get('/users/:id/messages', async (req, res) => {
  try {
    const messages = await Message.find({ userId: req.params.id }).sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error getting user messages:', error);
    res.status(500).json({ message: error.message });
  }
});

export { router as usersRouter }; 