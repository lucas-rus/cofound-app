import React, { useEffect, useState, useRef } from 'react';
import { Container, Form, Button, Card, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { FiSend, FiArrowLeft } from 'react-icons/fi';
import Avatar from '../components/Avatar';

const DirectChat = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchUser();
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchUser = async () => {
    try {
      const res = await api.get(`/api/users/${userId}/profile`);
      setOtherUser(res.data);
      setLoading(false);
    } catch (e) {
      console.error(e);
      navigate('/dashboard'); 
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/api/messages/${userId}`);
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
      await api.post(`/api/messages/${userId}`, newMessage, {
          headers: { 'Content-Type': 'text/plain' }
      });
      setNewMessage('');
      fetchMessages();
    } catch (e) {
      alert("Failed to send");
    }
  };

  if (loading || !otherUser) return <div className="text-center mt-5"><Spinner animation="border"/></div>;

  return (
    <Container className="py-4">
      <div className="d-flex align-items-center mb-3">
        <Button variant="link" className="text-dark p-0 me-3" onClick={() => navigate(-1)}>
            <FiArrowLeft size={24}/>
        </Button>
        <Avatar user={otherUser} size={40} className="me-2" />
        <h4 className="fw-bold mb-0">{otherUser.username}</h4>
      </div>

      <Card className="card-custom border-0 shadow-sm" style={{height: '70vh'}}>
        <div className="d-flex flex-column h-100">
          <div className="flex-grow-1 overflow-auto p-3 bg-light d-flex flex-column gap-3">
            {messages.map((msg) => {
              const isMe = msg.senderId === user.id;
              
              return (
                <div key={msg.id} className={`d-flex flex-column mb-3 ${isMe ? 'align-items-end' : 'align-items-start'}`}>
                  <div className="d-flex align-items-end gap-2" style={{maxWidth: '100%'}}>
                     {!isMe && (
                        <Avatar user={otherUser} size={32} className="flex-shrink-0 border shadow-sm" />
                     )}

                     <div 
                       className={`p-3 shadow-sm ${isMe ? 'bg-primary text-white' : 'bg-white text-dark'}`}
                       style={{ 
                            borderRadius: '18px',
                            borderBottomRightRadius: isMe ? '4px' : '18px',
                            borderBottomLeftRadius: !isMe ? '4px' : '18px',
                            width: 'fit-content',
                            overflowWrap: 'break-word',
                            wordBreak: 'normal',
                            whiteSpace: 'pre-wrap',
                            maxWidth: '80%'
                       }}
                     >
                       <p className="mb-0 text-start">{msg.content}</p>
                     </div>

                     {isMe && (
                        <Avatar user={user} size={32} className="flex-shrink-0 border shadow-sm" />
                     )}
                  </div>
                  <small className="text-muted mt-1 mx-1" style={{fontSize: '0.7rem'}}>
                     {formatRelativeTime(msg.sentAt)}
                  </small>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          
          <Card.Footer className="bg-white border-top p-3">
            <Form onSubmit={handleSend} className="d-flex gap-2">
                <Form.Control
                type="text"
                placeholder={`Message ${otherUser.username}...`}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="shadow-sm flex-grow-1"
                style={{borderRadius: '20px'}}
                />
                <Button type="submit" variant="primary" className="btn-primary-custom px-4" style={{borderRadius: '20px'}}>
                <FiSend />
                </Button>
            </Form>
          </Card.Footer>
        </div>
      </Card>
    </Container>
  );
};

export default DirectChat;