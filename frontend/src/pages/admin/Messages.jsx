import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Send, MessageSquare, Users, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import useAuthStore from '../../store/authStore';
import { messagesAPI } from '../../lib/api';
import { formatDateTime, timeAgo } from '../../lib/utils';
import toast from 'react-hot-toast';

const AdminMessages = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    today: 0
  });

  useEffect(() => {
    fetchConversations();
    fetchMessageStats();
    
    // Check for query params to auto-select user
    const params = new URLSearchParams(location.search);
    const userId = params.get('userId');
    const userName = params.get('userName');
    
    if (userId && userName) {
      // Create a temporary conversation object for the selected user
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
      const response = await messagesAPI.getConversations();
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const response = await messagesAPI.getMessages(userId);
      const msgList = response.data.messages || [];
      // Reverse to show oldest first (latest at bottom)
      setMessages([...msgList].reverse());
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const fetchMessageStats = async () => {
    try {
      // Mock stats - replace with actual API call
      setStats({
        total: conversations.length,
        unread: conversations.filter(c => c.unreadCount > 0).length,
        today: 5
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      await messagesAPI.sendMessage({
        receiver: selectedConversation._id,
        content: newMessage.trim(),
      });

      setNewMessage('');
      fetchMessages(selectedConversation._id);
      fetchConversations();
      toast.success('Message sent!');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage platform communications
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Conversations</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Unread Messages</p>
                  <p className="text-2xl font-bold">{stats.unread}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Messages Today</p>
                  <p className="text-2xl font-bold">{stats.today}</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Messages Interface */}
        <Card>
          <CardContent className="p-0">
            <div className="grid md:grid-cols-3 h-[600px]">
              {/* Conversations List */}
              <div className="border-r flex flex-col">
                <div className="p-4 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Spinner />
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No conversations yet</p>
                    </div>
                  ) : (
                    filteredConversations.map((conv) => (
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
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(conv.user.fullName || 'User')}`;
                                }}
                              />
                            ) : (
                              <img 
                                src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(conv.user?.fullName || 'User')}`}
                                alt={conv.user?.fullName || 'User'} 
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium truncate">{conv.user?.fullName || 'Unknown'}</p>
                                <Badge variant="outline" className="text-xs capitalize">
                                  {conv.user?.role || 'user'}
                                </Badge>
                              </div>
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
                      <div className="flex items-center justify-between">
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
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-muted-foreground">{selectedConversation.email}</p>
                              <Badge variant="outline" className="text-xs capitalize">
                                {selectedConversation.role}
                              </Badge>
                            </div>
                          </div>
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
                      <p className="text-lg font-medium mb-2">Admin Message Center</p>
                      <p className="text-muted-foreground">
                        Select a conversation to view and respond to messages
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

export default AdminMessages;
