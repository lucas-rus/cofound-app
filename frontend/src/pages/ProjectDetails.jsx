import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Tabs, Tab, Alert, Spinner } from 'react-bootstrap';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { FiCheckCircle, FiXCircle, FiUser, FiClock, FiMessageSquare } from 'react-icons/fi';
import ProjectChat from '../components/ProjectChat';
import Avatar from '../components/Avatar';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [team, setTeam] = useState([]);
  const [applications, setApplications] = useState([]);
  const [myApplication, setMyApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyLoading, setApplyLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Check permissions
  const isOwner = project && user && project.owner && project.owner.id === user.id;
  const isMember = team.some(m => m.id === user?.id) || isOwner;

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  useEffect(() => {
    if (isOwner) {
      fetchApplications();
    } else if (project) {
        fetchMyApplication();
    }
  }, [isOwner, project]); 

  const fetchProjectDetails = async () => {
    try {
      const response = await api.get('/api/projects');
      const found = response.data.find(p => p.id === parseInt(id));
      if (found) {
        setProject(found);
        fetchTeam();
      } else {
        setMsg({ type: 'danger', text: 'Project not found' });
      }
    } catch (error) {
      console.error("Error fetching project", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplication = async () => {
    try {
      const res = await api.get('/api/applications/my-applications');
      const myApp = res.data.find(app => app.project.id === parseInt(id));
      setMyApplication(myApp);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTeam = async () => {
    try {
      const res = await api.get(`/api/projects/${id}/team`);
      setTeam(res.data);
    } catch (e) {}
  };

  const fetchApplications = async () => {
    try {
      const res = await api.get(`/api/applications/for-project/${id}`);
      setApplications(res.data);
    } catch (e) {
      console.error("Error fetching apps", e);
    }
  };

  const handleApply = async () => {
    setApplyLoading(true);
    setMsg({type: '', text: ''});
    try {
      await api.post(`/api/applications/apply/project/${id}`);
      setMsg({ type: 'success', text: 'Application submitted successfully!' });
    } catch (error) {
      setMsg({ type: 'danger', text: error.response?.data || 'Failed to apply' });
    } finally {
      setApplyLoading(false);
    }
  };

  const handleAppDecision = async (appId, status) => {
    try {
      await api.patch(`/api/applications/${appId}/status`, status, {
        headers: { 'Content-Type': 'text/plain' } 
      });
      fetchApplications();
      fetchProjectDetails(); 
      fetchTeam();
    } catch (error) {
      console.error(error);
      alert(error.response?.data || "Action failed");
    }
  };

  const handleFinishProject = async () => {
    if (!window.confirm("Are you sure you want to mark this project as completed? This will move it to history.")) return;
    try {
      await api.post(`/api/projects/${id}/complete`);
      fetchProjectDetails();
    } catch (e) {
      alert("Failed to complete project");
    }
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (!project) return <Alert variant="danger">Project not found</Alert>;

  return (
    <Container className="py-4">
      {msg.text && <Alert variant={msg.type} dismissible onClose={() => setMsg({})}>{msg.text}</Alert>}
      
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h1 className="fw-bold mb-2">{project.title}</h1>
          <p className="text-muted mb-0">Owned by <Link to={`/users/${project.owner.id}`} className="text-decoration-none">@{project.owner.username}</Link></p>
        </div>
        <div className="d-flex align-items-center gap-3">
            {isOwner && project.status !== 'COMPLETED' && (
                <Button variant="outline-success" onClick={handleFinishProject}>Mark as Completed</Button>
            )}
            <Badge bg={project.status === 'RECRUITING' ? 'success' : 'secondary'} className="px-3 py-2 fs-6">
              {project.status}
            </Badge>
        </div>
      </div>

      <Tabs defaultActiveKey="overview" className="mb-4 custom-tabs">
        <Tab eventKey="overview" title="Overview">
          <Row>
            <Col md={8}>
              <Card className="card-custom mb-4">
                <Card.Body>
                  <h5 className="fw-bold mb-3">About the Project</h5>
                  <p className="text-secondary" style={{whiteSpace: 'pre-wrap'}}>{project.description}</p>
                  
                  <h6 className="fw-bold mt-4 mb-2">Required Skills</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {project.requiredSkills.map(skill => (
                      <Badge key={skill} bg="light" text="dark" className="border px-3 py-2 fw-normal">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4}>
              <Card className="card-custom mb-4">
                <Card.Body>
                  <h5 className="fw-bold mb-3">Team Status</h5>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Current Members</span>
                    <span className="fw-bold">{project.membersCount}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span className="text-muted">Target Size</span>
                    <span className="fw-bold">{project.teamSizeNeeded}</span>
                  </div>
                  
                  {!isMember && !isOwner && (
                    <>
                      {myApplication ? (
                        <div className="text-center">
                          {myApplication.status === 'PENDING' && <Badge bg="warning" text="dark" className="p-2 w-100 fs-6">Application Pending</Badge>}
                          {myApplication.status === 'REJECTED' && <Badge bg="danger" className="p-2 w-100 fs-6">Application Rejected</Badge>}
                          {myApplication.status === 'ACCEPTED' && <Badge bg="success" className="p-2 w-100 fs-6">Application Accepted</Badge>}
                        </div>
                      ) : (
                        <Button 
                          variant="primary" 
                          className="w-100 btn-primary-custom"
                          onClick={handleApply}
                          disabled={applyLoading || project.status !== 'RECRUITING'}
                        >
                          {applyLoading ? 'Applying...' : 'Apply to Join'}
                        </Button>
                      )}
                    </>
                  )}
                  {isMember && <div className="text-center text-success fw-bold"><FiCheckCircle className="me-1"/> You are a member</div>}
                </Card.Body>
              </Card>

              {/* Team List */}
              {team.length > 0 && (
                <Card className="card-custom">
                  <Card.Body>
                    <h6 className="fw-bold mb-3">Current Team</h6>
                    <div className="list-group list-group-flush">
                      {team.map(member => (
                        <Link 
                          key={member.id} 
                          to={`/users/${member.id}`} 
                          className="list-group-item list-group-item-action d-flex align-items-center border-0 px-2 py-2 rounded mb-1"
                        >
                          <Avatar user={member} size={32} className="me-3" />
                          <span className="fw-medium text-dark">{member.username}</span>
                        </Link>
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>
        </Tab>
        
        {isMember && (
            <Tab eventKey="chat" title={<span className="d-flex align-items-center gap-2"><FiMessageSquare/> Team Chat</span>}>
                <Card className="card-custom">
                    <Card.Body>
                        <ProjectChat projectId={id} />
                    </Card.Body>
                </Card>
            </Tab>
        )}

        {isOwner && (
          <Tab eventKey="applications" title={`Applications (${applications.filter(a => a.status === 'PENDING').length})`}>
             {applications.length === 0 ? (
               <div className="text-center py-5 bg-white rounded shadow-sm">
                 <p className="text-muted">No applications yet.</p>
               </div>
             ) : (
               <div className="d-flex flex-column gap-3">
                 {applications.map(app => (
                   <Card key={app.id} className={`card-custom ${app.status !== 'PENDING' ? 'opacity-75' : ''}`}>
                     <Card.Body className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                        <div className="d-flex align-items-center gap-3">
                          <div className="bg-light rounded-circle p-3">
                            <FiUser size={24} className="text-primary"/>
                          </div>
                          <div>
                            <Link to={`/users/${app.applicant.id}`} className="h5 mb-1 text-decoration-none">{app.applicant.username}</Link>
                            <div className="d-flex flex-wrap gap-1 mb-1">
                              {app.applicant.skills.map(s => (
                                <Badge key={s} bg="light" text="dark" className="border text-muted small">{s}</Badge>
                              ))}
                            </div>
                            <small className="text-muted">
                              Applied: {new Date(app.appliedAt).toLocaleDateString()}
                            </small>
                          </div>
                        </div>

                        <div>
                          {app.status === 'PENDING' ? (
                            <div className="d-flex gap-2">
                              <Button variant="outline-success" size="sm" onClick={() => handleAppDecision(app.id, 'ACCEPTED')}>
                                <FiCheckCircle className="me-1"/> Accept
                              </Button>
                              <Button variant="outline-danger" size="sm" onClick={() => handleAppDecision(app.id, 'REJECTED')}>
                                <FiXCircle className="me-1"/> Reject
                              </Button>
                            </div>
                          ) : (
                            <Badge bg={app.status === 'ACCEPTED' ? 'success' : 'danger'}>
                              {app.status}
                            </Badge>
                          )}
                        </div>
                     </Card.Body>
                   </Card>
                 ))}
               </div>
             )}
          </Tab>
        )}
      </Tabs>
    </Container>
  );
};

export default ProjectDetails;