import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  conversationId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  userName: {
    type: String,
    required: true
  },
  messageAuthor: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  fileUrl: {
    type: String,
    required: false
  },
  text: {
    type: String,
    required: true
  },
  
  language: {
    type: String,
    required: true
  },
  agent: {
    type: String,
    required: true
  },
  toolsCalled: {
    type: Array,
    required: true
  },
  // Additional fields can be added here as needed
}, {
  timestamps: true, // Adds createdAt and updatedAt fields automatically
  collection: 'messages'
});

const Message = mongoose.model('Message', messageSchema);

export default Message;
