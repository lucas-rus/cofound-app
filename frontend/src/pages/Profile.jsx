import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, Alert, Modal } from 'react-bootstrap';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiTrash2, FiEdit2, FiSave, FiUser, FiLinkedin, FiGithub, FiGlobe, FiFileText } from 'react-icons/fi';
import Avatar from '../components/Avatar';

const Profile = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Profile Data
  const [profileData, setProfileData] = useState({
    bio: '',
    lookingFor: '',
    offering: '',
    commitmentLevel: '',
    linkedInUrl: '',
    websiteUrl: '',
    githubUrl: '',
    cvUrl: '',
    profilePictureUrl: '',
    activeProjects: [],
    pastProjects: []
  });
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [selectedFile, setSelectedFile] = useState(null); // Profile Pic
  const [selectedCv, setSelectedCv] = useState(null); // CV

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/api/users/${user.id}/profile`);
      setProfileData(res.data);
      setSkills(res.data.skills);
      setEditForm({
        bio: res.data.bio || '',
        lookingFor: res.data.lookingFor || '',
        offering: res.data.offering || '',
        commitmentLevel: res.data.commitmentLevel || '',
        linkedInUrl: res.data.linkedInUrl || '',
        websiteUrl: res.data.websiteUrl || '',
        githubUrl: res.data.githubUrl || '',
        cvUrl: res.data.cvUrl || '',
        profilePictureUrl: res.data.profilePictureUrl || ''
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    try {
      const res = await api.post('/api/users/me/skills', [newSkill]);
      setSkills(res.data);
      setNewMessage('');
    } catch (e) {
      alert("Failed to add skill");
    }
  };

  const handleRemoveSkill = async (skillName) => {
    try {
      const res = await api.delete(`/api/users/me/skills/${encodeURIComponent(skillName)}`);
      setSkills(res.data);
    } catch (e) {
      alert("Failed to remove skill");
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleCvChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedCv(e.target.files[0]);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      let finalForm = { ...editForm };

      // 1. Upload Profile Picture
      if (selectedFile) {
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            const uploadRes = await api.post('/api/users/me/profile-picture', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
            finalForm.profilePictureUrl = uploadRes.data.profilePictureUrl;
        } catch (err) {
            console.error(err);
            alert("Failed to upload profile picture. " + (err.response?.data?.message || ""));
            return; // Stop here
        }
      }

      // 2. Upload CV
      if (selectedCv) {
        try {
            const formData = new FormData();
            formData.append('file', selectedCv);
            const uploadCvRes = await api.post('/api/users/me/cv', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
            finalForm.cvUrl = uploadCvRes.data.cvUrl;
        } catch (err) {
            console.error(err);
            alert("Failed to upload CV. Is the file too large? (Max 10MB)");
            return; // Stop here
        }
      }

      // 3. Update Text Fields
      await api.put('/api/users/me/profile', finalForm);
      
      // Refresh data
      const res = await api.get(`/api/users/${user.id}/profile`);
      setProfileData(res.data); 
      setEditing(false);
      setSelectedFile(null);
      setSelectedCv(null);
      await refreshUser();
    } catch(e) {
      console.error(e);
      alert("Failed to save profile details");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/api/users/me');
      logout();
      navigate('/');
    } catch (e) {
      console.error(e);
      alert("Failed to delete account. " + (e.response?.data || ""));
    }
  };

  const openDeleteModal = () => {
    setDeleteConfirmationText('');
    setShowDeleteModal(true);
  };

  // Helper
  const ensureAbsoluteUrl = (url) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8} lg={7}>
          
          {/* User Header */}
          <Card className="card-custom mb-4 text-center p-4">
            <div className="position-absolute top-0 end-0 p-3">
              <Button variant="light" size="sm" onClick={() => setEditing(!editing)}>
                 {editing ? 'Cancel' : <><FiEdit2 className="me-1"/> Edit Profile</>}
              </Button>
            </div>
            <Card.Body>
              <div className="d-flex justify-content-center">
                {selectedFile ? (
                  <img 
                    src={URL.createObjectURL(selectedFile)} 
                    alt="Preview"
                    className="rounded-circle border border-4 border-light shadow-sm mb-3"
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                  />
                ) : (
                  <Avatar user={{ ...user, profilePictureUrl: profileData.profilePictureUrl }} size={100} className="border border-4 border-light shadow-sm mb-3" />
                )}
              </div>
              <h3 className="fw-bold">{user?.username}</h3>
              <p className="text-muted">{user?.email}</p>
              
              {!editing ? (
                <>
                  <p className="text-secondary mt-3">{profileData.bio || "No bio yet."}</p>
                  
                  {(profileData.lookingFor || profileData.offering || profileData.commitmentLevel) && (
                    <div className="text-start mt-4 bg-light p-3 rounded-3 border">
                        {profileData.lookingFor && (
                            <div className="mb-2">
                                <strong className="text-primary">Looking For:</strong> <span className="text-dark">{profileData.lookingFor}</span>
                            </div>
                        )}
                        {profileData.offering && (
                            <div className="mb-2">
                                <strong className="text-success">Offering:</strong> <span className="text-dark">{profileData.offering}</span>
                            </div>
                        )}
                        {profileData.commitmentLevel && (
                            <div className="d-flex align-items-center">
                                <strong className="text-muted me-2">Commitment:</strong> <Badge bg="primary">{profileData.commitmentLevel}</Badge>
                            </div>
                        )}
                    </div>
                  )}

                  <div className="d-flex justify-content-center gap-2 mt-3 flex-wrap">
                    {profileData.websiteUrl && <a href={ensureAbsoluteUrl(profileData.websiteUrl)} target="_blank" className="btn btn-sm btn-outline-dark"><FiGlobe className="me-1"/> Website</a>}
                    {profileData.githubUrl && <a href={ensureAbsoluteUrl(profileData.githubUrl)} target="_blank" className="btn btn-sm btn-outline-dark"><FiGithub className="me-1"/> GitHub</a>}
                    {profileData.linkedInUrl && <a href={ensureAbsoluteUrl(profileData.linkedInUrl)} target="_blank" className="btn btn-sm btn-outline-primary"><FiLinkedin className="me-1"/> LinkedIn</a>}
                    {profileData.cvUrl && <a href={profileData.cvUrl} target="_blank" className="btn btn-sm btn-outline-secondary"><FiFileText className="me-1"/> Resume</a>}
                  </div>
                </>
              ) : (
                <div className="text-start mt-4">
                  <Form.Group className="mb-3">
                    <Form.Label>Profile Picture</Form.Label>
                    <Form.Control 
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Bio</Form.Label>
                    <Form.Control 
                      as="textarea" rows={3} 
                      value={editForm.bio} 
                      onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Looking For (e.g. Technical Co-founder)</Form.Label>
                    <Form.Control 
                      as="textarea" rows={2}
                      placeholder="Describe who you want to meet..."
                      value={editForm.lookingFor} 
                      onChange={(e) => setEditForm({...editForm, lookingFor: e.target.value})}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Offering (e.g. Marketing, Capital)</Form.Label>
                    <Form.Control 
                      as="textarea" rows={2}
                      placeholder="Describe what you bring to the table..."
                      value={editForm.offering} 
                      onChange={(e) => setEditForm({...editForm, offering: e.target.value})}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Commitment Level</Form.Label>
                    <Form.Select 
                        value={editForm.commitmentLevel} 
                        onChange={(e) => setEditForm({...editForm, commitmentLevel: e.target.value})}
                    >
                        <option value="">Select...</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Side Project">Side Project</option>
                        <option value="Just Exploring">Just Exploring</option>
                    </Form.Select>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Website URL</Form.Label>
                            <Form.Control type="text" value={editForm.websiteUrl} onChange={(e) => setEditForm({...editForm, websiteUrl: e.target.value})} />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>GitHub URL</Form.Label>
                            <Form.Control type="text" value={editForm.githubUrl} onChange={(e) => setEditForm({...editForm, githubUrl: e.target.value})} />
                        </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>LinkedIn URL</Form.Label>
                            <Form.Control type="text" value={editForm.linkedInUrl} onChange={(e) => setEditForm({...editForm, linkedInUrl: e.target.value})} />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>CV / Resume</Form.Label>
                            <Form.Control 
                              type="file"
                              onChange={handleCvChange}
                              accept=".pdf,.doc,.docx"
                            />
                            {editForm.cvUrl && <Form.Text className="text-muted">Current: <a href={editForm.cvUrl} target="_blank">View</a></Form.Text>}
                        </Form.Group>
                    </Col>
                  </Row>

                  <Button className="w-100 btn-primary-custom mt-3" onClick={handleUpdateProfile}>Save Changes</Button>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Skills Section */}
          <Card className="card-custom mb-4">
            <Card.Body>
              <h5 className="fw-bold mb-4">My Skills</h5>
              <Form onSubmit={handleAddSkill} className="mb-4">
                <div className="d-flex gap-2">
                  <Form.Control 
                    placeholder="Add a skill (e.g. React, Java, Marketing)" 
                    value={newSkill}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <Button type="submit" variant="outline-primary">Add</Button>
                </div>
              </Form>
              <div className="d-flex flex-wrap gap-2">
                {skills.map(skill => (
                  <Badge key={skill} bg="light" text="dark" className="d-flex align-items-center gap-2 border px-3 py-2 fw-normal">
                    {skill}
                    <FiTrash2 className="text-danger cursor-pointer" style={{cursor:'pointer'}} onClick={() => handleRemoveSkill(skill)}/>
                  </Badge>
                ))}
              </div>
            </Card.Body>
          </Card>

          {/* Projects Link & Delete Account */}
          <div className="text-center d-flex flex-column gap-3">
             <Button variant="link" href={`/users/${user.id}`}>View Public Profile Page</Button>
             
             <div className="border-top pt-3 mt-2">
                <Button variant="outline-danger" size="sm" onClick={openDeleteModal}>
                  <FiTrash2 className="me-1"/> Delete My Account
                </Button>
             </div>
          </div>

        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">Delete Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <FiTrash2 className="me-2"/>
            <strong>Warning:</strong> This action is permanent and cannot be undone. All your data, projects, and messages will be permanently removed.
          </Alert>
          <p>Please type <strong>delete</strong> to confirm.</p>
          <Form.Control 
            type="text" 
            placeholder='Type "delete" here'
            value={deleteConfirmationText}
            onChange={(e) => setDeleteConfirmationText(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteAccount}
            disabled={deleteConfirmationText.toLowerCase() !== 'delete'}
          >
            Confirm Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Profile;