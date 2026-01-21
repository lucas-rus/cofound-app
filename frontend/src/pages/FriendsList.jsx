import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Form, InputGroup } from 'react-bootstrap';
import api from '../api/axiosConfig';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMessageSquare, FiUserX, FiCheck, FiX, FiSearch, FiUserPlus } from 'react-icons/fi';
import Avatar from '../components/Avatar';

const FriendsList = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  
  const [newPeopleResults, setNewPeopleResults] = useState([]);
  const [newPeopleQuery, setNewPeopleQuery] = useState('');
  
  const [friendQuery, setFriendQuery] = useState('');
  
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [friendsRes, requestsRes, recRes] = await Promise.all([
        api.get('/api/friends'),
        api.get('/api/friends/requests'),
        api.get('/api/friends/recommendations')
      ]);
      setFriends(friendsRes.data);
      setRequests(requestsRes.data);
      setRecommendations(recRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchNewPeople = async (e) => {
    e.preventDefault();
    if (!newPeopleQuery.trim()) return;
    try {
      const res = await api.get(`/api/friends/search?q=${encodeURIComponent(newPeopleQuery)}`);
      
      // Filter out myself and existing friends
      const friendIds = new Set(friends.map(f => f.id));
      if (user) friendIds.add(user.id);
      
      const filtered = res.data.filter(u => !friendIds.has(u.id));
      setNewPeopleResults(filtered);
    } catch (e) {
      console.error(e);
    }
  };

  const handleConnect = async (userId) => {
    try {
      await api.post(`/api/friends/request/${userId}`);
      alert("Request sent!");
      // Optimistic update
      setRecommendations(prev => prev.filter(u => u.id !== userId));
      setNewPeopleResults(prev => prev.filter(u => u.id !== userId));
    } catch (e) {
      alert("Failed to send request");
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await api.put(`/api/friends/request/${requestId}/accept`);
      fetchData();
    } catch (e) {
      alert("Failed to accept");
    }
  };

  const handleReject = async (requestId) => {
    try {
      await api.put(`/api/friends/request/${requestId}/reject`);
      fetchData();
    } catch (e) {
      alert("Failed to reject");
    }
  };

  const handleMessage = (userId) => {
    navigate(`/messages/${userId}`);
  };

  const filteredFriends = friends.filter(f => 
    f.username.toLowerCase().includes(friendQuery.toLowerCase())
  );

  return (
    <Container className="py-4">
      <h2 className="fw-bold mb-4">My Network</h2>

      {/* Search New People */}
      <div className="mb-5 bg-light p-4 rounded-3 border">
        <h5 className="mb-3">Find New Connections</h5>
        <Form onSubmit={handleSearchNewPeople}>
            <InputGroup>
                <InputGroup.Text><FiSearch /></InputGroup.Text>
                <Form.Control 
                    placeholder="Search for people not in your network..." 
                    value={newPeopleQuery}
                    onChange={(e) => setNewPeopleQuery(e.target.value)}
                />
                <Button type="submit" variant="primary">Search</Button>
            </InputGroup>
        </Form>
        {newPeopleResults.length > 0 ? (
            <div className="mt-3">
                <h6 className="mb-2 text-muted">Results</h6>
                <Row xs={1} md={2} lg={3} className="g-3">
                    {newPeopleResults.map(u => (
                        <Col key={u.id}>
                            <Card className="card-custom">
                                <Card.Body className="d-flex align-items-center justify-content-between">
                                    <Link to={`/users/${u.id}`} className="d-flex align-items-center gap-2 text-decoration-none text-dark">
                                        <Avatar user={u} size={40} />
                                        <span className="fw-bold">{u.username}</span>
                                    </Link>
                                    <Button size="sm" onClick={() => handleConnect(u.id)}><FiUserPlus/> Connect</Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        ) : newPeopleQuery && newPeopleResults.length === 0 && (
             <p className="text-muted mt-2 small">No new people found.</p>
        )}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mb-5">
            <h4 className="fw-bold mb-3 text-primary">Recommended for You</h4>
            <Row xs={1} md={2} lg={3} className="g-4">
                {recommendations.map(rec => (
                    <Col key={rec.id}>
                        <Card className="card-custom h-100 bg-white border shadow-sm">
                            <Card.Body className="text-center">
                                <Link to={`/users/${rec.id}`} className="text-decoration-none text-dark d-block mb-2">
                                    <div className="d-flex justify-content-center">
                                        <Avatar user={rec} size={60} className="mb-2" />
                                    </div>
                                    <h6 className="fw-bold">{rec.username}</h6>
                                </Link>
                                <small className="text-muted d-block mb-3">Based on shared skills/projects</small>
                                <Button size="sm" variant="outline-primary" onClick={() => handleConnect(rec.id)}><FiUserPlus/> Connect</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
      )}

      {/* Pending Requests */}
      {requests.length > 0 && (
        <div className="mb-5">
          <h4 className="fw-bold mb-3 text-warning">Pending Requests</h4>
          <Row xs={1} md={2} lg={3} className="g-4">
            {requests.map(req => (
              <Col key={req.id}>
                <Card className="card-custom h-100 border-warning border-opacity-25">
                  <Card.Body className="d-flex align-items-center gap-3">
                    <Avatar user={req.sender} size={50} />
                    <div className="flex-grow-1">
                      <h6 className="fw-bold mb-1">{req.sender.username}</h6>
                      <small className="text-muted">Wants to connect</small>
                    </div>
                  </Card.Body>
                  <Card.Footer className="bg-white border-0 pt-0 d-flex gap-2">
                    <Button variant="success" size="sm" className="w-50" onClick={() => handleAccept(req.id)}>
                      <FiCheck className="me-1"/> Accept
                    </Button>
                    <Button variant="outline-danger" size="sm" className="w-50" onClick={() => handleReject(req.id)}>
                      <FiX className="me-1"/> Reject
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* Friends List */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-0">Friends ({friends.length})</h4>
      </div>
      
      {/* Search My Friends */}
      {friends.length > 0 && (
          <div className="mb-4" style={{maxWidth: '400px'}}>
            <InputGroup size="sm">
                <InputGroup.Text className="bg-white"><FiSearch/></InputGroup.Text>
                <Form.Control 
                    placeholder="Search your friends..." 
                    value={friendQuery}
                    onChange={(e) => setFriendQuery(e.target.value)}
                    className="border-start-0"
                />
            </InputGroup>
          </div>
      )}

      {friends.length === 0 ? (
        <Alert variant="light" className="text-center py-5">
          <h5 className="text-muted">You haven't connected with anyone yet.</h5>
          <p>Use the search above to find new people!</p>
        </Alert>
      ) : filteredFriends.length === 0 ? (
          <p className="text-muted">No friends match "{friendQuery}".</p>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {filteredFriends.map(friend => (
            <Col key={friend.id}>
              <Card className="card-custom h-100">
                <Card.Body className="d-flex align-items-center gap-3">
                  <Avatar user={friend} size={50} />
                  <div>
                    <h6 className="fw-bold mb-0">
                      <a href={`/users/${friend.id}`} className="text-decoration-none text-dark">{friend.username}</a>
                    </h6>
                  </div>
                </Card.Body>
                <Card.Footer className="bg-white border-0 pt-0">
                   <Button variant="outline-primary" size="sm" className="w-100" onClick={() => handleMessage(friend.id)}>
                     <FiMessageSquare className="me-1"/> Message
                   </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default FriendsList;
