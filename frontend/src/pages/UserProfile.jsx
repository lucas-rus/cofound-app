import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Spinner, ListGroup, Button, Modal, Form, OverlayTrigger, Popover } from 'react-bootstrap';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { FiExternalLink, FiGithub, FiLinkedin, FiFileText, FiGlobe, FiUserPlus, FiMessageSquare, FiCheck, FiX, FiThumbsUp, FiStar, FiGrid, FiArrowRight } from 'react-icons/fi';
import Avatar from '../components/Avatar';

const UserProfile = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [friendStatus, setFriendStatus] = useState({ status: 'NONE', senderId: null, requestId: null });
  const [reviews, setReviews] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', projectId: '' });
  const [myProjects, setMyProjects] = useState([]);

  useEffect(() => {
    if (userId) {
      setLoading(true); // Reset loading
      setProfile(null); // Clear previous profile
      fetchProfile();
      checkFriendStatus();
      fetchReviews();
    }
  }, [userId]);

  const fetchReviews = async () => {
      try {
          const res = await api.get(`/api/reviews/${userId}`);
          setReviews(res.data);
      } catch (e) {}
  };

  const handleEndorse = async (skillName) => {
      try {
          await api.post(`/api/skills/${userId}/endorse`, skillName, { headers: {'Content-Type': 'text/plain'} });
          fetchProfile(); // Refresh to see count
      } catch (e) {
          alert(e.response?.data || "Failed to endorse");
      }
  };

  const handleOpenReviewModal = async () => {
      try {
          const res = await api.get('/api/projects/my-projects');
          setMyProjects(res.data);
          setShowReviewModal(true);
      } catch (e) {
          alert("Failed to load projects");
      }
  };

  const handleReviewSubmit = async () => {
      try {
          await api.post('/api/reviews', {
              revieweeId: userId,
              projectId: reviewForm.projectId,
              rating: reviewForm.rating,
              comment: reviewForm.comment
          });
          setShowReviewModal(false);
          setReviewForm({ rating: 5, comment: '', projectId: '' });
          fetchReviews();
      } catch (e) {
          alert(e.response?.data || "Failed to submit review");
      }
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/api/users/${userId}/profile`);
      setProfile(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const checkFriendStatus = async () => {
    if (!user) return;
    try {
      const res = await api.get(`/api/friends/check/${userId}`);
      setFriendStatus(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendRequest = async () => {
    try {
      await api.post(`/api/friends/request/${userId}`);
      checkFriendStatus();
    } catch (e) {
      alert("Failed to send request");
    }
  };

  const handleAcceptRequest = async () => {
    try {
      await api.put(`/api/friends/request/${friendStatus.requestId}/accept`);
      checkFriendStatus();
    } catch (e) {
      alert("Failed to accept");
    }
  };

  const handleRejectRequest = async () => {
    try {
      await api.put(`/api/friends/request/${friendStatus.requestId}/reject`);
      checkFriendStatus();
    } catch (e) {
      alert("Failed to reject");
    }
  };

  const handleMessage = () => {
    navigate(`/messages/${userId}`);
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border"/></div>;
  if (!profile) return <div className="text-center mt-5">User not found</div>;

  const isMe = user && user.id === Number(userId);

  // Helper to ensure absolute URLs
  const ensureAbsoluteUrl = (url) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="card-custom mb-4 border-0 overflow-hidden">
            <div style={{ height: '100px', background: 'linear-gradient(90deg, #0056b3, #3b82f6)' }}></div>
            <Card.Body className="text-center" style={{ marginTop: '-60px' }}>
              <div className="d-flex justify-content-center">
                <Avatar user={profile} size={120} className="border border-4 border-white shadow-sm mb-3" />
              </div>
              <h2 className="fw-bold mt-3 mb-1">{profile.username}</h2>
              
              <div className="d-flex justify-content-center align-items-center gap-2 mb-3">
                  <div className="d-flex text-warning">
                      {[...Array(5)].map((_, i) => (
                          <FiStar key={i} className={i < Math.round(profile.averageRating || 0) ? "fill-warning" : ""} style={{fill: i < Math.round(profile.averageRating || 0) ? 'currentColor' : 'none'}} />
                      ))}
                  </div>
                  <span className="text-muted small">({profile.reviewCount || 0} reviews)</span>
              </div>
              
              {!isMe && user && (
                <div className="mt-3">
                  {friendStatus.status === 'NONE' && (
                    <Button variant="primary" size="sm" onClick={handleSendRequest}>
                      <FiUserPlus className="me-1"/> Connect
                    </Button>
                  )}
                  {friendStatus.status === 'PENDING' && friendStatus.senderId === user.id && (
                    <Button variant="secondary" size="sm" disabled>
                      <FiCheck className="me-1"/> Request Sent
                    </Button>
                  )}
                  {friendStatus.status === 'PENDING' && friendStatus.senderId !== user.id && (
                    <div className="d-flex gap-2 justify-content-center">
                      <Button variant="success" size="sm" onClick={handleAcceptRequest}>Accept</Button>
                      <Button variant="outline-danger" size="sm" onClick={handleRejectRequest}>Reject</Button>
                    </div>
                  )}
                  {friendStatus.status === 'ACCEPTED' && (
                    <Button variant="primary" size="sm" onClick={handleMessage}>
                      <FiMessageSquare className="me-1"/> Message
                    </Button>
                  )}
                  {friendStatus.status === 'REJECTED' && (
                     <Button variant="secondary" size="sm" disabled>Rejected</Button>
                  )}
                </div>
              )}

              <div className="d-flex justify-content-center gap-3 mb-4 mt-3 flex-wrap">
                {profile.websiteUrl && (
                  <Button variant="outline-dark" size="sm" href={ensureAbsoluteUrl(profile.websiteUrl)} target="_blank">
                    <FiGlobe className="me-1"/> Website
                  </Button>
                )}
                {profile.githubUrl && (
                  <Button variant="outline-dark" size="sm" href={ensureAbsoluteUrl(profile.githubUrl)} target="_blank">
                    <FiGithub className="me-1"/> GitHub
                  </Button>
                )}
                {profile.linkedInUrl && (
                  <Button variant="outline-primary" size="sm" href={ensureAbsoluteUrl(profile.linkedInUrl)} target="_blank">
                    <FiLinkedin className="me-1"/> LinkedIn
                  </Button>
                )}
                {profile.cvUrl && (
                  <Button variant="outline-secondary" size="sm" href={ensureAbsoluteUrl(profile.cvUrl)} target="_blank">
                    <FiFileText className="me-1"/> Resume / CV
                  </Button>
                )}
              </div>

              {profile.bio && (
                <div className="text-start px-md-5">
                   <h6 className="fw-bold text-uppercase text-muted small mb-2">About Me</h6>
                   <p className="text-secondary">{profile.bio}</p>
                </div>
              )}

              {(profile.lookingFor || profile.offering || profile.commitmentLevel) && (
                <div className="text-start px-md-5 mt-4">
                    <div className="bg-light p-3 rounded-3 border">
                        {profile.lookingFor && (
                            <div className="mb-2">
                                <strong className="text-primary">Looking For:</strong> <span className="text-dark">{profile.lookingFor}</span>
                            </div>
                        )}
                        {profile.offering && (
                            <div className="mb-2">
                                <strong className="text-success">Offering:</strong> <span className="text-dark">{profile.offering}</span>
                            </div>
                        )}
                        {profile.commitmentLevel && (
                            <div>
                                <strong className="text-muted">Commitment:</strong> <Badge bg="primary">{profile.commitmentLevel}</Badge>
                            </div>
                        )}
                    </div>
                </div>
              )}
            </Card.Body>
          </Card>

          <Row>
             <Col md={6}>
               <Card className="card-custom mb-4 h-100">
                 <Card.Body>
                   <h5 className="fw-bold mb-3">Skills</h5>
                   <div className="d-flex flex-wrap gap-2">
                     {profile.skills.map(skill => {
                       const endorsers = profile.skillEndorsements ? profile.skillEndorsements[skill] : [];
                       const count = endorsers ? endorsers.length : 0;
                       const isEndorsedByMe = user && endorsers && endorsers.some(e => e.id === user.id);
                       
                       const popover = (
                         <Popover id={`popover-${skill}`}>
                           <Popover.Header as="h3">Endorsed by</Popover.Header>
                           <Popover.Body className="p-2">
                             {endorsers && endorsers.map(e => (
                               <div key={e.id} className="d-flex align-items-center gap-2 mb-2">
                                 <Avatar user={e} size={24} />
                                 <span className="small">{e.username}</span>
                               </div>
                             ))}
                           </Popover.Body>
                         </Popover>
                       );

                       return (
                         <Badge key={skill} bg="light" text="dark" className="border px-3 py-2 fw-normal d-flex align-items-center gap-2">
                           {skill}
                           {count > 0 && (
                              <OverlayTrigger trigger={['hover', 'focus']} placement="top" overlay={popover}>
                                <Badge bg="secondary" pill className="cursor-pointer">+{count}</Badge>
                              </OverlayTrigger>
                           )}
                           {!isMe && user && (
                              <FiThumbsUp 
                                className={`cursor-pointer ${isEndorsedByMe ? "text-primary" : "text-muted"}`} 
                                style={{cursor:'pointer', fill: isEndorsedByMe ? 'currentColor' : 'none'}} 
                                onClick={() => handleEndorse(skill)} 
                                title={isEndorsedByMe ? "Remove endorsement" : "Endorse this skill"}
                              />
                           )}
                         </Badge>
                       );
                     })}
                     {profile.skills.length === 0 && <span className="text-muted">No skills listed.</span>}
                   </div>
                 </Card.Body>
               </Card>
             </Col>
             
             <Col md={6}>
                <Card className="card-custom mb-4 h-100">
                  <Card.Body>
                    <h5 className="fw-bold mb-3">Active Projects</h5>
                    <div className="d-flex flex-column gap-2 justify-content-center align-items-center" style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '5px' }}>
                      {profile.activeProjects.map(p => (
                        <Card 
                            key={p.id} 
                            className="border-0 shadow-sm bg-white" 
                            style={{cursor: 'pointer', transition: 'transform 0.2s', maxWidth: '350px', width: '100%'}}
                            onClick={() => navigate(`/projects/${p.id}`)}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                          <Card.Body className="d-flex align-items-center justify-content-between p-3">
                             <div className="d-flex align-items-center gap-3">
                                <div className="d-flex flex-column justify-content-center">
                                   <h6 className="fw-bold text-dark my-0">{p.title}</h6>
                                   <Badge bg="success" bg="opacity-75" className="fw-normal mt-1" style={{fontSize: '0.7rem'}}>Active</Badge>
                                </div>
                             </div>
                             <FiArrowRight className="text-muted" />
                          </Card.Body>
                        </Card>
                      ))}
                      {profile.activeProjects.length === 0 && <span className="text-muted">No active projects.</span>}
                    </div>
                  </Card.Body>
                </Card>
             </Col>
          </Row>

          <Card className="card-custom mt-4">
            <Card.Body>
              <h5 className="fw-bold mb-3">Project History</h5>
              {(!profile.projectHistory || profile.projectHistory.length === 0) ? (
                <p className="text-muted">No project history found.</p>
              ) : (
                <ListGroup variant="flush">
                  {profile.projectHistory.map((h, idx) => (
                    <ListGroup.Item key={idx} className="d-flex justify-content-between align-items-center px-0">
                      <div>
                        <span className="fw-medium text-dark">{h.projectName}</span>
                        <div className="small text-muted">
                          {h.startedAt ? new Date(h.startedAt).toLocaleDateString() : 'Unknown'} - {h.endedAt ? new Date(h.endedAt).toLocaleDateString() : 'Present'}
                        </div>
                      </div>
                      <div className="me-3">
                        {h.status === 'COMPLETED' ? (
                            <Badge bg="success">Completed</Badge> 
                        ) : (
                            <Badge bg="secondary">Ended</Badge>
                        )}
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>

          {/* Reviews Section */}
          <Card className="card-custom mt-4">
            <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0">Reviews</h5>
                </div>
                {reviews.length === 0 ? <p className="text-muted">No reviews yet.</p> : (
                    <div className="d-flex flex-column gap-3">
                        {reviews.map(r => (
                            <div key={r.id} className="border-bottom pb-3">
                                <div className="d-flex justify-content-between">
                                    <div className="d-flex align-items-center gap-2">
                                        <Avatar user={{ username: r.reviewerName, profilePictureUrl: r.reviewerPic }} size={30} />
                                        <div>
                                            <strong>{r.reviewerName}</strong>
                                            <span className="text-muted small ms-2">on {r.projectName}</span>
                                        </div>
                                    </div>
                                    <div>
                                        {[...Array(5)].map((_, i) => (
                                            <FiStar key={i} className={i < r.rating ? "text-warning" : "text-muted"} style={{fill: i < r.rating ? 'currentColor' : 'none'}}/>
                                        ))}
                                    </div>
                                </div>
                                <p className="mt-2 mb-0">{r.comment}</p>
                                <small className="text-muted">{new Date(r.createdAt).toLocaleDateString()}</small>
                            </div>
                        ))}
                    </div>
                )}
            </Card.Body>
          </Card>

        </Col>
      </Row>

      {/* Review Modal (Removed Button, but keeping modal code or removing it? 
          User said remove button. I should remove the modal too as it's unreachable now.) 
      */}
    </Container>
  );
};

export default UserProfile;
