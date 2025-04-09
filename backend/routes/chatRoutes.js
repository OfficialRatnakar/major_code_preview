import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
    getUserChats,
    createChat,
    getChatDetails,
    sendMessage,
    markMessagesAsRead
} from '../controllers/chatController.js';

const router = express.Router();

// All routes are protected and require authentication
router.use(protect);

// Get all chats for the current user
router.get('/', getUserChats);

// Create a new chat
router.post('/', createChat);

// Get chat details by ID
router.get('/:chatId', getChatDetails);

// Send a message in a chat
router.post('/:chatId/messages', sendMessage);

// Mark messages as read in a chat
router.put('/:chatId/read', markMessagesAsRead);

export default router; 