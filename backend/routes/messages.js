import express from 'express';
import Message from '../models/messages.js';

const router = express.Router();

// GET all messages
router.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single message by ID
router.get('/messages/:id', async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST a new message
router.post('/messages', async (req, res) => {
  try {
    console.log('Received message save request:', {
      sender: req.body.sender,
      conversationId: req.body.conversationId,
      messageAuthor: req.body.messageAuthor,
      messageType: req.body.messageType
    });
    
    const newMessage = new Message(req.body);
    const savedMessage = await newMessage.save();
    console.log('Message saved to database:', savedMessage._id);
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error('Error saving message to database:', error.message);
    if (error.name === 'ValidationError') {
      console.error('Validation error details:', error.errors);
    }
    res.status(400).json({ message: error.message });
  }
});

// UPDATE a message
router.put('/messages/:id', async (req, res) => {
  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    res.status(200).json(updatedMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a message
router.delete('/messages/:id', async (req, res) => {
  try {
    const deletedMessage = await Message.findByIdAndDelete(req.params.id);
    
    if (!deletedMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export const messagesRouter = router; 