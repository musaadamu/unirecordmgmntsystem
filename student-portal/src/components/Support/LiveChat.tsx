import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Badge,
  Chip,
  Button,
  Divider,
  Paper,
  InputAdornment,
} from '@mui/material';
import {
  Send,
  AttachFile,
  EmojiEmotions,
  Person,
  Support,
  SmartToy,
  Circle,
  Search,
  Add,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';

import { ChatConversation, ChatMessage } from '@/services/supportService';
import { useAuthStore } from '@/stores/authStore';

const LiveChat: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  // Mock conversations
  const mockConversations: ChatConversation[] = [
    {
      _id: '1',
      participants: [
        {
          _id: 'student1',
          name: 'You',
          role: 'student',
        },
        {
          _id: 'support1',
          name: 'Sarah Johnson',
          role: 'support',
          avatar: '/avatars/sarah.jpg',
          lastSeen: '2024-01-16T10:30:00Z',
        },
      ],
      type: 'support',
      title: 'Technical Support',
      lastMessage: {
        _id: 'msg1',
        conversation: '1',
        sender: {
          _id: 'support1',
          name: 'Sarah Johnson',
          role: 'staff',
        },
        message: 'I\'ll help you resolve this issue right away.',
        messageType: 'text',
        readBy: [],
        timestamp: '2024-01-16T10:30:00Z',
      },
      unreadCount: 1,
      isActive: true,
      createdAt: '2024-01-16T09:00:00Z',
      updatedAt: '2024-01-16T10:30:00Z',
    },
    {
      _id: '2',
      participants: [
        {
          _id: 'student1',
          name: 'You',
          role: 'student',
        },
        {
          _id: 'bot1',
          name: 'UniBot',
          role: 'bot',
          avatar: '/avatars/bot.png',
        },
      ],
      type: 'support',
      title: 'AI Assistant',
      lastMessage: {
        _id: 'msg2',
        conversation: '2',
        sender: {
          _id: 'bot1',
          name: 'UniBot',
          role: 'bot',
        },
        message: 'How can I help you today? I can assist with course information, schedules, and general questions.',
        messageType: 'text',
        readBy: [],
        timestamp: '2024-01-15T14:20:00Z',
      },
      unreadCount: 0,
      isActive: true,
      createdAt: '2024-01-15T14:00:00Z',
      updatedAt: '2024-01-15T14:20:00Z',
    },
    {
      _id: '3',
      participants: [
        {
          _id: 'student1',
          name: 'You',
          role: 'student',
        },
        {
          _id: 'advisor1',
          name: 'Dr. Michael Brown',
          role: 'staff',
          avatar: '/avatars/michael.jpg',
          lastSeen: '2024-01-15T16:45:00Z',
        },
      ],
      type: 'direct',
      title: 'Academic Advisor',
      lastMessage: {
        _id: 'msg3',
        conversation: '3',
        sender: {
          _id: 'student1',
          name: 'You',
          role: 'student',
        },
        message: 'Thank you for the course recommendations!',
        messageType: 'text',
        readBy: [],
        timestamp: '2024-01-15T16:45:00Z',
      },
      unreadCount: 0,
      isActive: false,
      createdAt: '2024-01-15T15:00:00Z',
      updatedAt: '2024-01-15T16:45:00Z',
    },
  ];

  // Mock messages for selected conversation
  const mockMessages: { [key: string]: ChatMessage[] } = {
    '1': [
      {
        _id: 'msg1',
        conversation: '1',
        sender: {
          _id: 'student1',
          name: 'You',
          role: 'student',
        },
        message: 'Hi, I\'m having trouble accessing my course materials. The download links are not working.',
        messageType: 'text',
        readBy: [],
        timestamp: '2024-01-16T10:00:00Z',
      },
      {
        _id: 'msg2',
        conversation: '1',
        sender: {
          _id: 'support1',
          name: 'Sarah Johnson',
          role: 'staff',
        },
        message: 'Hello! I\'m sorry to hear you\'re having trouble. Let me check your account and course access permissions.',
        messageType: 'text',
        readBy: [],
        timestamp: '2024-01-16T10:15:00Z',
      },
      {
        _id: 'msg3',
        conversation: '1',
        sender: {
          _id: 'support1',
          name: 'Sarah Johnson',
          role: 'staff',
        },
        message: 'I can see the issue. There was a temporary server problem affecting file downloads. I\'ve refreshed your access and the downloads should work now. Can you please try again?',
        messageType: 'text',
        readBy: [],
        timestamp: '2024-01-16T10:25:00Z',
      },
      {
        _id: 'msg4',
        conversation: '1',
        sender: {
          _id: 'support1',
          name: 'Sarah Johnson',
          role: 'staff',
        },
        message: 'I\'ll help you resolve this issue right away.',
        messageType: 'text',
        readBy: [],
        timestamp: '2024-01-16T10:30:00Z',
      },
    ],
    '2': [
      {
        _id: 'msg5',
        conversation: '2',
        sender: {
          _id: 'bot1',
          name: 'UniBot',
          role: 'bot',
        },
        message: 'Hello! I\'m UniBot, your AI assistant. How can I help you today? I can assist with course information, schedules, and general questions.',
        messageType: 'text',
        readBy: [],
        timestamp: '2024-01-15T14:20:00Z',
      },
    ],
    '3': [
      {
        _id: 'msg6',
        conversation: '3',
        sender: {
          _id: 'advisor1',
          name: 'Dr. Michael Brown',
          role: 'staff',
        },
        message: 'Hi! I\'ve reviewed your academic progress and have some course recommendations for next semester.',
        messageType: 'text',
        readBy: [],
        timestamp: '2024-01-15T15:30:00Z',
      },
      {
        _id: 'msg7',
        conversation: '3',
        sender: {
          _id: 'student1',
          name: 'You',
          role: 'student',
        },
        message: 'That would be great! What courses do you recommend?',
        messageType: 'text',
        readBy: [],
        timestamp: '2024-01-15T15:35:00Z',
      },
      {
        _id: 'msg8',
        conversation: '3',
        sender: {
          _id: 'advisor1',
          name: 'Dr. Michael Brown',
          role: 'staff',
        },
        message: 'Based on your major and interests, I recommend CS401 (Advanced Algorithms), CS420 (Machine Learning), and MATH301 (Statistics). These will complement your current coursework well.',
        messageType: 'text',
        readBy: [],
        timestamp: '2024-01-15T15:40:00Z',
      },
      {
        _id: 'msg9',
        conversation: '3',
        sender: {
          _id: 'student1',
          name: 'You',
          role: 'student',
        },
        message: 'Thank you for the course recommendations!',
        messageType: 'text',
        readBy: [],
        timestamp: '2024-01-15T16:45:00Z',
      },
    ],
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation]);

  const getParticipantAvatar = (participant: any) => {
    if (participant.role === 'bot') {
      return <SmartToy />;
    }
    if (participant.role === 'student') {
      return <Person />;
    }
    return <Support />;
  };

  const getOnlineStatus = (participant: any) => {
    if (participant.role === 'bot') return true;
    if (participant.lastSeen) {
      const lastSeen = new Date(participant.lastSeen);
      const now = new Date();
      const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60);
      return diffMinutes < 5; // Online if last seen within 5 minutes
    }
    return false;
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    console.log('Sending message...', {
      conversationId: selectedConversation,
      message: newMessage,
    });
    
    setNewMessage('');
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = mockConversations.filter(conv =>
    conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.participants.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedConv = mockConversations.find(conv => conv._id === selectedConversation);
  const messages = selectedConversation ? mockMessages[selectedConversation] || [] : [];

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Live Chat & Messaging
      </Typography>

      <Grid container spacing={2} sx={{ height: '600px' }}>
        {/* Conversations List */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ pb: 1 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Conversations
                </Typography>
                <Button size="small" startIcon={<Add />}>
                  New Chat
                </Button>
              </Box>
              
              <TextField
                fullWidth
                size="small"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </CardContent>
            
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <List sx={{ p: 0 }}>
                {filteredConversations.map((conversation, index) => {
                  const otherParticipant = conversation.participants.find(p => p._id !== 'student1');
                  const isOnline = otherParticipant ? getOnlineStatus(otherParticipant) : false;
                  
                  return (
                    <React.Fragment key={conversation._id}>
                      <ListItem
                        button
                        selected={selectedConversation === conversation._id}
                        onClick={() => setSelectedConversation(conversation._id)}
                        sx={{
                          '&.Mui-selected': {
                            bgcolor: 'primary.light',
                            '&:hover': {
                              bgcolor: 'primary.light',
                            },
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            badgeContent={
                              isOnline ? (
                                <Circle sx={{ color: 'success.main', fontSize: 12 }} />
                              ) : null
                            }
                          >
                            <Avatar>
                              {getParticipantAvatar(otherParticipant)}
                            </Avatar>
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="subtitle2" fontWeight="bold">
                                {conversation.title || otherParticipant?.name}
                              </Typography>
                              {conversation.unreadCount > 0 && (
                                <Badge badgeContent={conversation.unreadCount} color="error" />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {conversation.lastMessage?.message}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {conversation.lastMessage && 
                                  format(parseISO(conversation.lastMessage.timestamp), 'MMM dd, h:mm a')
                                }
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < filteredConversations.length - 1 && <Divider />}
                    </React.Fragment>
                  );
                })}
              </List>
            </Box>
          </Card>
        </Grid>

        {/* Chat Area */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {selectedConv ? (
              <>
                {/* Chat Header */}
                <CardContent sx={{ pb: 1, borderBottom: 1, borderColor: 'divider' }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        selectedConv.participants.find(p => p._id !== 'student1') &&
                        getOnlineStatus(selectedConv.participants.find(p => p._id !== 'student1')) ? (
                          <Circle sx={{ color: 'success.main', fontSize: 12 }} />
                        ) : null
                      }
                    >
                      <Avatar>
                        {getParticipantAvatar(selectedConv.participants.find(p => p._id !== 'student1'))}
                      </Avatar>
                    </Badge>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {selectedConv.title || selectedConv.participants.find(p => p._id !== 'student1')?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedConv.participants.find(p => p._id !== 'student1')?.role === 'bot' 
                          ? 'AI Assistant' 
                          : getOnlineStatus(selectedConv.participants.find(p => p._id !== 'student1'))
                            ? 'Online'
                            : 'Offline'
                        }
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>

                {/* Messages */}
                <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                  {messages.map((message) => {
                    const isOwnMessage = message.sender._id === 'student1';
                    
                    return (
                      <Box
                        key={message._id}
                        display="flex"
                        justifyContent={isOwnMessage ? 'flex-end' : 'flex-start'}
                        mb={2}
                      >
                        <Box
                          sx={{
                            maxWidth: '70%',
                            p: 2,
                            borderRadius: 2,
                            bgcolor: isOwnMessage ? 'primary.main' : 'grey.100',
                            color: isOwnMessage ? 'primary.contrastText' : 'text.primary',
                          }}
                        >
                          {!isOwnMessage && (
                            <Typography variant="caption" fontWeight="bold" display="block" mb={0.5}>
                              {message.sender.name}
                            </Typography>
                          )}
                          <Typography variant="body2">
                            {message.message}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              opacity: 0.7,
                              display: 'block',
                              textAlign: 'right',
                              mt: 0.5,
                            }}
                          >
                            {format(parseISO(message.timestamp), 'h:mm a')}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </Box>

                {/* Message Input */}
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Box display="flex" gap={1} alignItems="flex-end">
                    <TextField
                      fullWidth
                      multiline
                      maxRows={3}
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      variant="outlined"
                      size="small"
                    />
                    <IconButton color="primary">
                      <AttachFile />
                    </IconButton>
                    <IconButton color="primary">
                      <EmojiEmotions />
                    </IconButton>
                    <IconButton
                      color="primary"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      <Send />
                    </IconButton>
                  </Box>
                </Box>
              </>
            ) : (
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                height="100%"
                color="text.secondary"
              >
                <Chat sx={{ fontSize: 64, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Select a conversation to start chatting
                </Typography>
                <Typography variant="body2" textAlign="center">
                  Choose from your existing conversations or start a new chat with support staff
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LiveChat;
