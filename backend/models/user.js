import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now
  },
  name: {
    type: String,
    trim: true,
    default: ''
  },
  email: {
    type: String,
    trim: true,
    default: ''
  },
  language: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt fields automatically
  collection: 'users'
});

const User = mongoose.model('User', userSchema);

export default User; 