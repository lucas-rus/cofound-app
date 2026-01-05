import React, { useState } from 'react';
import { Form, Button, Card, Container, Row, Col, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { FiX } from 'react-icons/fi';

const CreateProject = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    teamSizeNeeded: 1
  });
  const [currentSkill, setCurrentSkill] = useState('');
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      const trimmed = currentSkill.trim();
      if (trimmed && !skills.includes(trimmed)) {
        setSkills([...skills, trimmed]);
        setCurrentSkill('');
      }
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/projects', {
        ...formData,
        requiredSkills: skills
      });
      navigate('/dashboard');
    } catch (error) {
      console.error("Error creating project", error);
      alert("Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <div className="mb-4">
            <h2 className="fw-bold">Create a Project</h2>
            <p className="text-muted">Share your idea and find your founding team.</p>
          </div>
          
          <Card className="card-custom p-4">
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Project Title</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="e.g., NextGen AI Healthcare" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required 
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Description</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={4}
                    placeholder="Describe your vision, goals, and what you're building..." 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required 
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Team Size Needed</Form.Label>
                  <Form.Control 
                    type="number" 
                    min="1"
                    max="20"
                    value={formData.teamSizeNeeded}
                    onChange={(e) => setFormData({...formData, teamSizeNeeded: parseInt(e.target.value)})}
                    required 
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-medium">Required Skills</Form.Label>
                  <div className="d-flex gap-2 mb-2">
                    <Form.Control 
                      type="text" 
                      placeholder="Type a skill and press Enter" 
                      value={currentSkill}
                      onChange={(e) => setCurrentSkill(e.target.value)}
                      onKeyDown={handleAddSkill}
                    />
                    <Button variant="outline-secondary" onClick={handleAddSkill}>Add</Button>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {skills.map(skill => (
                      <Badge key={skill} bg="primary" className="d-flex align-items-center gap-2 py-2 px-3 fw-normal">
                        {skill}
                        <FiX 
                          className="cursor-pointer" 
                          style={{cursor: 'pointer'}} 
                          onClick={() => removeSkill(skill)}
                        />
                      </Badge>
                    ))}
                  </div>
                </Form.Group>

                <div className="d-flex gap-3">
                  <Button variant="light" className="w-50" onClick={() => navigate(-1)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="w-50 btn-primary-custom"
                    disabled={loading}
                  >
                    {loading ? 'Publishing...' : 'Publish Project'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateProject;
