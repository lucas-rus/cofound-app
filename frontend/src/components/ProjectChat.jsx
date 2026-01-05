import React, { useEffect, useState, useRef } from 'react';
import { Form, Button, ListGroup } from 'react-bootstrap';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { FiSend } from 'react-icons/fi';

const ProjectChat = ({ projectId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/api/projects/${projectId}/messages`);
      // Only update if length changed to avoid jitter, ideally check IDs
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
      <div className="flex-grow-1 overflow-auto p-3 bg-light rounded mb-3 border">
        {messages.map((msg, idx) => {
          const isMe = msg.sender.id === user.id;
          return (
            <div key={msg.id} className={`d-flex flex-column mb-3 ${isMe ? 'align-items-end' : 'align-items-start'}`}>
              <div className={`d-flex align-items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                 {msg.sender.profilePictureUrl ? (
                   <img 
                     src={msg.sender.profilePictureUrl} 
                     alt={msg.sender.username}
                     className="rounded-circle border shadow-sm bg-white"
                     style={{width: 30, height: 30, objectFit: 'cover'}}
                     title={msg.sender.username}
                   />
                 ) : (
                   <div 
                     className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center small" 
                     style={{width: 30, height: 30, fontSize: '0.75rem'}}
                     title={msg.sender.username}
                   >
                     {msg.sender.username.charAt(0).toUpperCase()}
                   </div>
                 )}
                 <div 
                   className={`p-3 rounded-3 shadow-sm ${isMe ? 'bg-primary text-white' : 'bg-white text-dark'}`}
                   style={{ maxWidth: '80%', borderBottomRightRadius: isMe ? 0 : undefined, borderBottomLeftRadius: !isMe ? 0 : undefined }}
                 >
                   <p className="mb-0 text-break" style={{whiteSpace: 'pre-wrap'}}>{msg.content}</p>
                 </div>
              </div>
              <small className="text-muted mt-1 mx-5" style={{fontSize: '0.7rem'}}>
                 {!isMe && <span className="fw-bold me-1">{msg.sender.username}</span>}
                 {new Date(msg.sentAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </small>
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
          className="shadow-sm"
        />
        <Button type="submit" variant="primary" className="btn-primary-custom px-4">
          <FiSend />
        </Button>
      </Form>
    </div>
  );
};

export default ProjectChat;
