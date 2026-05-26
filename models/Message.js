const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  content: { type: String, default: '' },
  type: { type: String, enum: ['text', 'image', 'video'], default: 'text' },
  mediaUrl: { type: String },
  roomId: { type: String },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);
