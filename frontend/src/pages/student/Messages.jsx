import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Send, MessageSquare } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Spinner from '../../components/ui/Spinner';
import useAuthStore from '../../store/authStore';
import { messagesAPI } from '../../lib/api';
import { formatDateTime, timeAgo } from '../../lib/utils';
import toast from 'react-hot-toast';

const Messages = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    // Check for query params to start new conversation
    const params = new URLSearchParams(location.search);
    const userId = params.get('userId');
    const userName = params.get('userName');
    
    if (userId && userName) {
      // Create a temporary conversation object for new chat
      setSelectedConversation({
        _id: userId,
        fullName: userName,
        isNew: true
      });
    }
  }, [location.search]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await messagesAPI.getAll();
      console.log('Conversations API response:', response.data);
      const convList = response.data.conversations || response.data.data?.conversations || [];
      console.log('Extracted conversations:', convList);
      setConversations(convList);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      // Don't show error toast for empty conversations
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const response = await messagesAPI.getConversation(userId);
      console.log('Messages API response:', response.data);
      const msgList = response.data.messages || response.data.data?.messages || [];
      console.log('Extracted messages:', msgList);
      // Reverse to show oldest first (latest at bottom)
      setMessages([...msgList].reverse());
      
      // Try to mark as read, but don't fail if it errors
      try {
        await messagesAPI.markAllAsRead(userId);
      } catch (readError) {
        console.warn('Failed to mark messages as read:', readError);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      console.log('Sending message:', {
        receiver: selectedConversation._id,
        content: newMessage
      });
      
      const response = await messagesAPI.send({
        receiver: selectedConversation._id,
        content: newMessage,
      });
      
      console.log('Message sent response:', response.data);
      setNewMessage('');
      
      // Refresh messages and conversations
      await fetchMessages(selectedConversation._id);
      await fetchConversations();
      
      toast.success('Message sent!');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground mt-2">
            Chat with recruiters and team members
          </p>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="grid md:grid-cols-3 h-[600px]">
              {/* Conversations List */}
              <div className="border-r">
                <div className="p-4 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search conversations..."
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="overflow-y-auto h-[calc(600px-73px)]">
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <Spinner />
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="text-center py-12 px-4">
                      <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No conversations yet</p>
                    </div>
                  ) : (
                    conversations.map((conv) => (
                      <div
                        key={conv._id}
                        onClick={() => setSelectedConversation(conv.user || conv)}
                        className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                          selectedConversation?._id === conv.user?._id || selectedConversation?._id === conv._id ? 'bg-muted' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {conv.user?.avatar ? (
                              <img 
                                src={conv.user.avatar} 
                                alt={conv.user.fullName} 
                                className="h-10 w-10 rounded-full object-cover"
                                onError={(e) => {
                                  // Fallback to DiceBear if image fails to load
                                  e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(conv.user.fullName || 'User')}`;
                                }}
                              />
                            ) : (
                              <img 
                                src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(conv.user?.fullName || 'User')}`}
                                alt={conv.user?.fullName || 'User'} 
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium truncate">{conv.user?.fullName || 'Unknown'}</p>
                              <span className="text-xs text-muted-foreground">
                                {timeAgo(conv.lastMessage?.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {conv.lastMessage?.content || 'No messages yet'}
                            </p>
                          </div>
                          {conv.unreadCount > 0 && (
                            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                              <span className="text-xs text-white">{conv.unreadCount}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Messages Area */}
              <div className="md:col-span-2 flex flex-col">
                {selectedConversation ? (
                  <>
                    {/* Header */}
                    <div className="p-4 border-b">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                          {selectedConversation.avatar ? (
                            <img 
                              src={selectedConversation.avatar} 
                              alt={selectedConversation.fullName}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedConversation.fullName || 'User')}`;
                              }}
                            />
                          ) : (
                            <img 
                              src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedConversation.fullName || 'User')}`}
                              alt={selectedConversation.fullName}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{selectedConversation.fullName}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {selectedConversation.role}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50" ref={messagesEndRef}>
                      {messages.map((message) => {
                        const isSent = message.sender._id === user?._id || message.sender === user?._id;
                        return (
                          <div
                            key={message._id}
                            className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[75%] rounded-lg px-4 py-2 shadow-sm ${
                                isSent
                                  ? 'bg-green-500 text-white rounded-br-none'
                                  : 'bg-white text-gray-900 rounded-bl-none'
                              }`}
                            >
                              <p className="text-sm break-words">{message.content}</p>
                              <p
                                className={`text-xs mt-1 text-right ${
                                  isSent ? 'text-green-100' : 'text-gray-500'
                                }`}
                              >
                                {new Date(message.createdAt).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t">
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          rows={2}
                          className="resize-none"
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={sending || !newMessage.trim()}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        Select a conversation to start messaging
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Messages;
