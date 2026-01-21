import React, { useEffect, useState, useRef } from 'react';
import { Form, Button } from 'react-bootstrap';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { FiSend } from 'react-icons/fi';
import Avatar from './Avatar';

const ProjectChat = ({ projectId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); 
    return () => clearInterval(interval);
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/api/projects/${projectId}/messages`);
      setMessages(prev => {
        if (res.data.length !== prev.length) return res.data;
        return prev; 
      });
    } catch (e) {
      console.error(e);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths}mo ago`;
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears}y ago`;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await api.post(`/api/projects/${projectId}/messages`, newMessage, {
          headers: { 'Content-Type': 'text/plain' }
      });
      setNewMessage('');
      fetchMessages();
    } catch (e) {
      alert("Failed to send");
    }
  };

  return (
    <div className="d-flex flex-column" style={{ height: '500px' }}>
      <div className="flex-grow-1 overflow-auto p-3 bg-light rounded mb-3 border d-flex flex-column gap-3">
        {messages.map((msg, idx) => {
          const isMe = msg.sender.id === user.id;
          
          return (
            <div key={msg.id} className={`d-flex w-100 ${isMe ? 'justify-content-end' : 'justify-content-start'}`}>
              <div className="d-flex align-items-end gap-2" style={{maxWidth: '85%'}}>
                
                {!isMe && <Avatar user={msg.sender} size={32} className="flex-shrink-0 border shadow-sm" />}

                <div className={`d-flex flex-column ${isMe ? 'align-items-end' : 'align-items-start'}`} style={{minWidth: 0}}>
                    <div 
                        className={`p-3 shadow-sm ${isMe ? 'bg-primary text-white' : 'bg-white text-dark'}`}
                        style={{ 
                            borderRadius: '18px',
                            borderBottomRightRadius: isMe ? '4px' : '18px',
                            borderBottomLeftRadius: !isMe ? '4px' : '18px',
                            width: 'fit-content',
                            overflowWrap: 'break-word',
                            wordBreak: 'normal',
                            whiteSpace: 'pre-wrap'
                        }}
                    >
                        <p className="mb-0 text-start">{msg.content}</p>
                    </div>
                    <small className="text-muted mt-1" style={{fontSize: '0.7rem'}}>
                        {!isMe && <span className="fw-bold me-1">{msg.sender.username}</span>}
                        {formatRelativeTime(msg.sentAt)}
                    </small>
                </div>

                {isMe && <Avatar user={msg.sender} size={32} className="flex-shrink-0 border shadow-sm" />}

              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      
      <Form onSubmit={handleSend} className="d-flex gap-2">
        <Form.Control
          type="text"
          placeholder="Type a message to the team..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="shadow-sm flex-grow-1"
          style={{borderRadius: '20px'}}
        />
        <Button type="submit" variant="primary" className="btn-primary-custom px-4" style={{borderRadius: '20px'}}>
          <FiSend />
        </Button>
      </Form>
    </div>
  );
};

export default ProjectChat;