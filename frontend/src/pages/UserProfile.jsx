import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Spinner, ListGroup, Button } from 'react-bootstrap';
import api from '../api/axiosConfig';
import { FiExternalLink, FiGithub, FiLinkedin, FiFileText, FiGlobe } from 'react-icons/fi';

const UserProfile = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

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

  if (loading) return <div className="text-center mt-5"><Spinner animation="border"/></div>;
  if (!profile) return <div className="text-center mt-5">User not found</div>;

  const avatarUrl = `https://robohash.org/${profile.username}?set=set3&bgset=bg2`;

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
          {/* Header Card */}
          <Card className="card-custom mb-4 border-0 overflow-hidden">
            <div style={{ height: '100px', background: 'linear-gradient(90deg, #0056b3, #3b82f6)' }}></div>
            <Card.Body className="text-center" style={{ marginTop: '-60px' }}>
              <img 
                src={profile.profilePictureUrl || avatarUrl} 
                alt={profile.username}
                className="rounded-circle border border-4 border-white shadow-sm bg-white"
                style={{ width: '120px', height: '120px', objectFit: 'cover' }}
              />
              <h2 className="fw-bold mt-3 mb-1">{profile.username}</h2>
              {/* <p className="text-muted mb-3">{profile.email}</p> Hidden for privacy */}
              
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
            </Card.Body>
          </Card>

          <Row>
             <Col md={6}>
               <Card className="card-custom mb-4 h-100">
                 <Card.Body>
                   <h5 className="fw-bold mb-3">Skills</h5>
                   <div className="d-flex flex-wrap gap-2">
                     {profile.skills.map(skill => (
                       <Badge key={skill} bg="light" text="dark" className="border px-3 py-2 fw-normal">
                         {skill}
                       </Badge>
                     ))}
                     {profile.skills.length === 0 && <span className="text-muted">No skills listed.</span>}
                   </div>
                 </Card.Body>
               </Card>
             </Col>
             
             <Col md={6}>
                <Card className="card-custom mb-4 h-100">
                  <Card.Body>
                    <h5 className="fw-bold mb-3">Active Projects</h5>
                    <ListGroup variant="flush">
                      {profile.activeProjects.map(p => (
                        <ListGroup.Item key={p.id} className="px-0 py-2 border-0">
                          <a href={`/projects/${p.id}`} className="text-decoration-none fw-medium text-primary">
                            {p.title}
                          </a>
                        </ListGroup.Item>
                      ))}
                      {profile.activeProjects.length === 0 && <span className="text-muted">No active projects.</span>}
                    </ListGroup>
                  </Card.Body>
                </Card>
             </Col>
          </Row>

          <Card className="card-custom mt-4">
            <Card.Body>
              <h5 className="fw-bold mb-3">Project History</h5>
              {profile.pastProjects.length === 0 ? (
                <p className="text-muted">No past projects found.</p>
              ) : (
                <ListGroup variant="flush">
                  {profile.pastProjects.map(p => (
                    <ListGroup.Item key={p.id} className="d-flex justify-content-between align-items-center px-0">
                      <div>
                        <a href={`/projects/${p.id}`} className="fw-medium text-dark text-decoration-none">{p.title}</a>
                        <div className="small text-muted">Completed</div>
                      </div>
                      <Badge bg="secondary">Finished</Badge>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>

        </Col>
      </Row>
    </Container>
  );
};

export default UserProfile;
