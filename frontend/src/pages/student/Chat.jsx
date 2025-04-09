import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import api from '../../utils/axios';

const Chat = () => {
  const { chatId } = useParams();
  const { user, isLoaded } = useUser();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchChat = async () => {
      if (!isLoaded || !user) return;
      
      try {
        const response = await api.get(`/api/chat/${chatId}`);
        setChat(response.data);
        setMessages(response.data.messages || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching chat:', error);
        toast.error('Failed to load chat');
        setLoading(false);
      }
    };

    if (chatId) {
      fetchChat();
    }
  }, [chatId, isLoaded, user]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      const response = await api.post(`/api/chat/${chatId}/messages`, {
        content: newMessage
      });
      setMessages(response.data.messages);
      setNewMessage('');
      toast.success('Message sent');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Please sign in to access chat</h2>
          <p className="text-gray-600">You need to be signed in to view and send messages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">
            {chat?.isGroup ? chat.groupName : 'Chat'}
          </h2>
        </div>

        <div className="h-[500px] overflow-y-auto p-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 ${
                message.sender === user?.id ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block p-3 rounded-lg ${
                  message.sender === user?.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <p>{message.content}</p>
                <span className="text-xs opacity-75">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat; 