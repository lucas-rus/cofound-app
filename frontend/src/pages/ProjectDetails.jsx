import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Tabs, Tab, Alert, Spinner, Modal, Form } from 'react-bootstrap';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { FiCheckCircle, FiXCircle, FiUser, FiClock, FiMessageSquare, FiTrash2, FiLogOut, FiActivity } from 'react-icons/fi';
import ProjectChat from '../components/ProjectChat';
import ProjectUpdateCard from '../components/ProjectUpdateCard';
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

      const [updates, setUpdates] = useState([]);
      const [newUpdateTitle, setNewUpdateTitle] = useState(''); // NEW STATE FOR TITLE
      const [newUpdateContent, setNewUpdateContent] = useState('');
      const [newUpdateFile, setNewUpdateFile] = useState(null);
      
      const [showKickModal, setShowKickModal] = useState(false);
          const [kickTarget, setKickTarget] = useState(null);
          const [kickReason, setKickReason] = useState('');
          const [activeTab, setActiveTab] = useState('overview'); // NEW: Active tab state
        
          // Edit Project State
          const [showEditProjectModal, setShowEditProjectModal] = useState(false);
          const [editProjectForm, setEditProjectForm] = useState({ title: '', description: '', teamSizeNeeded: 1, requiredSkills: [] });
          const [editProjectSkill, setEditProjectSkill] = useState('');
        
          // Check permissions
          const isOwner = project && user && project.owner && project.owner.id === user.id;
          const isMember = team.some(m => m.id === user?.id) || isOwner;
        
          useEffect(() => {
            fetchProjectDetails();
            fetchUpdates();
          }, [id]);
        
          useEffect(() => {
            if (isOwner) {
              fetchApplications();
            } else if (project) {
                fetchMyApplication();
            }
          }, [isOwner, project]); 
        
          // NEW: Handle Tab Selection
          const handleTabSelect = (k) => {
              setActiveTab(k);
              if (k === 'chat' && project) {
                  localStorage.setItem(`msg_count_${project.id}`, project.messageCount);
              }
          };
        
          const fetchUpdates = async () => {
          try {
              const res = await api.get(`/api/projects/${id}/updates`);
              setUpdates(res.data);
          } catch (e) {}
      };
  
      const handlePostUpdate = async (e) => {
          e.preventDefault();
          if (!newUpdateTitle.trim() || !newUpdateContent.trim()) return; // Title is now required
          try {
              const formData = new FormData();
              formData.append('title', newUpdateTitle); // APPEND TITLE
              formData.append('content', newUpdateContent);
              if (newUpdateFile) {
                  formData.append('file', newUpdateFile);
              }
              await api.post(`/api/projects/${id}/updates`, formData, {
                  headers: { 'Content-Type': 'multipart/form-data' }
              });
              setNewUpdateTitle(''); // CLEAR TITLE
              setNewUpdateContent('');
              setNewUpdateFile(null);
              fetchUpdates();
          } catch (e) {
              alert(e.response?.data || "Failed to post update"); // More robust error display
          }
      };
    const handleLeave = async () => {
      if (!window.confirm("Are you sure you want to leave this project?")) return;
      try {
          await api.post(`/api/projects/${id}/leave`);
          window.location.reload(); // Refresh to update UI/permissions
      } catch (e) {
          alert(e.response?.data || "Failed to leave project");
      }
  };

  const openKickModal = (member) => {
      setKickTarget(member);
      setKickReason('');
      setShowKickModal(true);
  };

  const handleKick = async () => {
      if (!kickTarget) return;
      try {
          await api.post(`/api/projects/${id}/kick`, { userId: kickTarget.id, reason: kickReason });
          setShowKickModal(false);
          fetchTeam();
      } catch (e) {
          alert(e.response?.data || "Failed to kick user");
      }
  };

  const handleOpenEditProjectModal = () => {
      setEditProjectForm({
          title: project.title,
          description: project.description,
          teamSizeNeeded: project.teamSizeNeeded,
          requiredSkills: [...project.requiredSkills]
      });
      setEditProjectSkill('');
      setShowEditProjectModal(true);
  };

  const handleEditProjectSubmit = async (e) => {
      e.preventDefault();
      try {
          await api.put(`/api/projects/${id}`, editProjectForm);
          setShowEditProjectModal(false);
          fetchProjectDetails();
      } catch (e) {
          alert(e.response?.data || "Failed to update project");
      }
  };

  const handleAddEditSkill = () => {
      const trimmed = editProjectSkill.trim();
      if (trimmed && !editProjectForm.requiredSkills.includes(trimmed)) {
          setEditProjectForm({
              ...editProjectForm,
              requiredSkills: [...editProjectForm.requiredSkills, trimmed]
          });
          setEditProjectSkill('');
      }
  };

  const handleRemoveEditSkill = (skillToRemove) => {
      setEditProjectForm({
          ...editProjectForm,
          requiredSkills: editProjectForm.requiredSkills.filter(s => s !== skillToRemove)
      });
  };

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

  const storedCount = parseInt(localStorage.getItem(`msg_count_${id}`) || '0');
  const newMessages = project ? Math.max(0, project.messageCount - storedCount) : 0;
  const pendingAppsCount = isOwner ? project.pendingApplicationsCount : 0;

  return (
    <Container className="py-4">
      {msg.text && <Alert variant={msg.type} dismissible onClose={() => setMsg({})}>{msg.text}</Alert>}
      
      {myApplication && !isOwner && !isMember && myApplication.status === 'PENDING' && (
          <Alert variant="warning" className="mb-4">
              <div className="d-flex align-items-center">
                  <FiClock size={24} className="me-2"/>
                  <div><strong>Application Pending</strong><br/>Your application is currently under review by the project owner.</div>
              </div>
          </Alert>
      )}

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

      <Tabs activeKey={activeTab} onSelect={handleTabSelect} className="mb-4 custom-tabs">
        <Tab eventKey="overview" title="Overview">
          <Row>
            <Col md={8}>
              <Card className="card-custom mb-4">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0">About the Project</h5>
                    {isOwner && (
                        <Button variant="outline-primary" size="sm" onClick={handleOpenEditProjectModal}>
                            Edit Details
                        </Button>
                    )}
                  </div>
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
                        <div key={member.id} className="list-group-item border-0 px-2 py-2 rounded mb-1 d-flex align-items-center justify-content-between">
                            <Link 
                              to={`/users/${member.id}`} 
                              className="d-flex align-items-center text-decoration-none text-dark flex-grow-1"
                            >
                              <Avatar user={member} size={32} className="me-3" />
                              <span className="fw-medium">{member.username}</span>
                            </Link>
                            {isOwner && member.id !== user.id && (
                                <Button variant="link" className="text-danger p-0" onClick={() => openKickModal(member)} title="Kick Member">
                                    <FiTrash2 />
                                </Button>
                            )}
                        </div>
                      ))}
                    </div>
                    {isMember && !isOwner && (
                        <div className="mt-3 border-top pt-3 text-center">
                            <Button variant="outline-danger" size="sm" onClick={handleLeave}>
                                <FiLogOut className="me-1"/> Leave Project
                            </Button>
                        </div>
                    )}
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="updates" title={<span className="d-flex align-items-center gap-2"><FiActivity/> Updates</span>}>
            <Container className="p-0">
                {(isOwner || isMember) && (
                    <Card className="card-custom mb-4">
                        <Card.Body>
                            <h6 className="fw-bold mb-3">Post an Update</h6>
                            <Form onSubmit={handlePostUpdate}>
                                <Form.Group className="mb-2">
                                    <Form.Label>Update Title</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        placeholder="Brief summary of the update"
                                        value={newUpdateTitle}
                                        onChange={(e) => setNewUpdateTitle(e.target.value)}
                                        maxLength={100}
                                        required
                                    />
                                    <Form.Text className="text-muted">
                                        Max 100 characters.
                                    </Form.Text>
                                </Form.Group>
                                <Form.Group className="mb-2">
                                    <Form.Control 
                                        as="textarea" rows={3} 
                                        placeholder="What's new?"
                                        value={newUpdateContent}
                                        onChange={(e) => setNewUpdateContent(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Tab') {
                                                e.preventDefault();
                                                const { selectionStart, selectionEnd } = e.target;
                                                const value = e.target.value;
                                                const spaces = '     '; // 5 spaces
                                                e.target.value = value.substring(0, selectionStart) + spaces + value.substring(selectionEnd);
                                                setNewUpdateContent(e.target.value);
                                                // Move cursor after the inserted spaces
                                                e.target.selectionStart = e.target.selectionEnd = selectionStart + spaces.length;
                                            }
                                        }}
                                        maxLength={3000}
                                    />
                                    <Form.Text className="text-muted">
                                        Max 3000 characters. Markdown is supported.
                                    </Form.Text>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Control 
                                        type="file" 
                                        accept="image/*"
                                        onChange={(e) => e.target.files && setNewUpdateFile(e.target.files[0])}
                                    />
                                </Form.Group>
                                <Button type="submit" size="sm" variant="primary">Post Update</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                )}
                
                {updates.length === 0 ? (
                    <div className="text-center py-5 bg-white rounded shadow-sm">
                        <p className="text-muted">No updates yet.</p>
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-3">
                        {updates.map(u => (
                            <ProjectUpdateCard key={u.id} update={u} onRefresh={fetchUpdates} isOwner={isOwner} />
                        ))}
                    </div>
                )}
            </Container>
        </Tab>
        
        {isMember && (
            <Tab eventKey="chat" title={
                <span className="d-flex align-items-center gap-2">
                    <FiMessageSquare/> Team Chat
                    {newMessages > 0 && <Badge bg="danger" pill>{newMessages}</Badge>}
                </span>
            }>
                <Card className="card-custom">
                    <Card.Body>
                        <ProjectChat projectId={id} />
                    </Card.Body>
                </Card>
            </Tab>
        )}

        {isOwner && (
          <Tab eventKey="applications" title={
              <span className="d-flex align-items-center gap-2">
                  Applications
                  {pendingAppsCount > 0 && <Badge bg="warning" text="dark" pill>{pendingAppsCount}</Badge>}
              </span>
          }>
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
                          <Avatar user={app.applicant} size={48} className="border" />
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

      <Modal show={showKickModal} onHide={() => setShowKickModal(false)} centered>
        <Modal.Header closeButton>
            <Modal.Title className="text-danger">Remove Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <p>Are you sure you want to remove <strong>{kickTarget?.username}</strong> from the project?</p>
            <Alert variant="warning" className="small">
                This action will remove them immediately. Please provide a reason.
            </Alert>
            <Form.Group>
                <Form.Label>Reason</Form.Label>
                <Form.Control 
                    as="textarea" rows={3} 
                    value={kickReason} 
                    onChange={(e) => setKickReason(e.target.value)}
                    placeholder="e.g. Inactivity, Violation of terms..."
                />
            </Form.Group>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowKickModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleKick} disabled={!kickReason.trim()}>Remove Member</Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Project Modal */}
      <Modal show={showEditProjectModal} onHide={() => setShowEditProjectModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Project Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditProjectSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Project Title</Form.Label>
              <Form.Control 
                type="text" 
                value={editProjectForm.title} 
                onChange={(e) => setEditProjectForm({...editProjectForm, title: e.target.value})}
                maxLength={50}
                required 
              />
              <Form.Text className="text-muted">Max 50 characters.</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" rows={6} 
                value={editProjectForm.description} 
                onChange={(e) => setEditProjectForm({...editProjectForm, description: e.target.value})}
                required 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Team Size Needed</Form.Label>
              <Form.Control 
                type="number" min="1" max="20"
                value={editProjectForm.teamSizeNeeded} 
                onChange={(e) => setEditProjectForm({...editProjectForm, teamSizeNeeded: parseInt(e.target.value)})}
                required 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Required Skills</Form.Label>
              <div className="d-flex gap-2 mb-2">
                <Form.Control 
                  type="text" 
                  placeholder="Add a skill" 
                  value={editProjectSkill}
                  onChange={(e) => setEditProjectSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEditSkill())}
                />
                <Button variant="outline-secondary" onClick={handleAddEditSkill}>Add</Button>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {editProjectForm.requiredSkills.map(skill => (
                  <Badge key={skill} bg="primary" className="d-flex align-items-center gap-2 py-2 px-3 fw-normal">
                    {skill}
                    <FiXCircle className="cursor-pointer" onClick={() => handleRemoveEditSkill(skill)} />
                  </Badge>
                ))}
              </div>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={() => setShowEditProjectModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Save Changes</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ProjectDetails;