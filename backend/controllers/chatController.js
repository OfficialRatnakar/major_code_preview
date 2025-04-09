import Chat from '../models/Chat.js';
import User from '../models/User.js';

// @desc    Get all chats for the current user
// @route   GET /api/chat
// @access  Private
export const getUserChats = async (req, res) => {
    try {
        const userId = req.user.id; // Clerk user ID
        const chats = await Chat.find({ participants: userId })
            .populate('participants', 'name email profilePicture')
            .populate('creator', 'name email profilePicture')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });

        res.json(chats);
    } catch (error) {
        console.error('Error fetching user chats:', error);
        res.status(500).json({ success: false, message: 'Error fetching chats' });
    }
};

// @desc    Create a new chat
// @route   POST /api/chat
// @access  Private
export const createChat = async (req, res) => {
    try {
        const { participants, isGroup, groupName } = req.body;
        const userId = req.user.id; // Clerk user ID

        // Validate participants
        if (!participants || !Array.isArray(participants) || participants.length === 0) {
            return res.status(400).json({ success: false, message: 'Participants are required' });
        }

        // Add current user to participants if not already included
        if (!participants.includes(userId)) {
            participants.push(userId);
        }

        // Check if a chat already exists with these participants
        const existingChat = await Chat.findOne({
            participants: { $all: participants },
            isGroup: false
        });

        if (existingChat) {
            return res.json(existingChat);
        }

        // Create new chat
        const newChat = await Chat.create({
            participants,
            isGroup: isGroup || false,
            groupName: isGroup ? groupName : null,
            creator: userId
        });

        const populatedChat = await Chat.findById(newChat._id)
            .populate('participants', 'name email profilePicture')
            .populate('creator', 'name email profilePicture');

        res.status(201).json(populatedChat);
    } catch (error) {
        console.error('Error creating chat:', error);
        res.status(500).json({ success: false, message: 'Error creating chat' });
    }
};

// @desc    Get chat details by ID
// @route   GET /api/chat/:chatId
// @access  Private
export const getChatDetails = async (req, res) => {
    try {
        const userId = req.user.id; // Clerk user ID
        const chat = await Chat.findById(req.params.chatId)
            .populate('participants', 'name email profilePicture')
            .populate('creator', 'name email profilePicture')
            .populate('messages.sender', 'name email profilePicture');

        if (!chat) {
            return res.status(404).json({ success: false, message: 'Chat not found' });
        }

        // Check if user is a participant
        if (!chat.participants.some(p => p._id === userId)) {
            return res.status(403).json({ success: false, message: 'Not authorized to access this chat' });
        }

        res.json(chat);
    } catch (error) {
        console.error('Error fetching chat details:', error);
        res.status(500).json({ success: false, message: 'Error fetching chat details' });
    }
};

// @desc    Send a message in a chat
// @route   POST /api/chat/:chatId/messages
// @access  Private
export const sendMessage = async (req, res) => {
    try {
        const { content } = req.body;
        const userId = req.user.id; // Clerk user ID

        if (!content) {
            return res.status(400).json({ success: false, message: 'Message content is required' });
        }

        const chat = await Chat.findById(req.params.chatId);

        if (!chat) {
            return res.status(404).json({ success: false, message: 'Chat not found' });
        }

        // Check if user is a participant
        if (!chat.participants.includes(userId)) {
            return res.status(403).json({ success: false, message: 'Not authorized to send messages in this chat' });
        }

        const newMessage = {
            sender: userId,
            content,
            timestamp: new Date(),
            readBy: [userId]
        };

        chat.messages.push(newMessage);
        chat.lastMessage = newMessage;
        await chat.save();

        const updatedChat = await Chat.findById(chat._id)
            .populate('participants', 'name email profilePicture')
            .populate('creator', 'name email profilePicture')
            .populate('messages.sender', 'name email profilePicture')
            .populate('lastMessage.sender', 'name email profilePicture');

        res.json(updatedChat);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ success: false, message: 'Error sending message' });
    }
};

// @desc    Mark messages as read in a chat
// @route   PUT /api/chat/:chatId/read
// @access  Private
export const markMessagesAsRead = async (req, res) => {
    try {
        const userId = req.user.id; // Clerk user ID
        const chat = await Chat.findById(req.params.chatId);

        if (!chat) {
            return res.status(404).json({ success: false, message: 'Chat not found' });
        }

        // Check if user is a participant
        if (!chat.participants.includes(userId)) {
            return res.status(403).json({ success: false, message: 'Not authorized to access this chat' });
        }

        // Mark all unread messages as read by the current user
        chat.messages.forEach(message => {
            if (!message.readBy.includes(userId)) {
                message.readBy.push(userId);
            }
        });

        await chat.save();

        res.json({ success: true, message: 'Messages marked as read' });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ success: false, message: 'Error marking messages as read' });
    }
}; 