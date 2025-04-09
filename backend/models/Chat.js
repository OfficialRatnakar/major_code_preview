import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: String, // Clerk user ID
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  readBy: [{
    type: String // Clerk user IDs
  }]
});

const chatSchema = new mongoose.Schema({
  participants: [{
    type: String // Clerk user IDs
  }],
  creator: {
    type: String, // Clerk user ID
    required: true
  },
  isGroup: {
    type: Boolean,
    default: false
  },
  groupName: {
    type: String,
    required: function() {
      return this.isGroup;
    }
  },
  messages: [messageSchema],
  lastMessage: {
    type: messageSchema,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
chatSchema.index({ participants: 1 });
chatSchema.index({ updatedAt: -1 });

const Chat = mongoose.model('Chat', chatSchema);

export default Chat; 