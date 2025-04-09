import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { toast } from 'react-hot-toast';
import api from '../../utils/axios';

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const fetchChats = async () => {
      if (!isLoaded || !user) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await api.get('/api/chat');
        setChats(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching chats:', error);
        toast.error('Failed to load chats');
        setLoading(false);
      }
    };

    fetchChats();
  }, [isLoaded, user]);

  const getOtherParticipant = (chat) => {
    return chat.participants.find(p => p._id !== user?.id);
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
          <h2 className="text-xl font-semibold mb-2">Please sign in to access chats</h2>
          <p className="text-gray-600">You need to be signed in to view your chats.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Your Chats</h2>
        </div>

        <div className="divide-y">
          {chats.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>You don&apos;t have any chats yet.</p>
              <p className="text-sm mt-2">Start a conversation with another user to see it here.</p>
            </div>
          ) : (
            chats.map((chat) => {
              const otherParticipant = getOtherParticipant(chat);
              return (
                <Link
                  key={chat._id}
                  to={`/chat/${chat._id}`}
                  className="block p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">
                        {chat.isGroup
                          ? chat.groupName
                          : otherParticipant?.name || 'Unknown User'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {chat.lastMessage?.content || 'No messages yet'}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {chat.lastMessage
                        ? new Date(chat.lastMessage.timestamp).toLocaleDateString()
                        : ''}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatList; 