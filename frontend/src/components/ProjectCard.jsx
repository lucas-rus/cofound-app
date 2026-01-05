import React from 'react';
import { Card, Badge, Button, Stack } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiTag, FiArrowRight } from 'react-icons/fi';

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();

  return (
    <Card className="card-custom h-100 d-flex flex-column">
      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Card.Title className="fw-bold mb-0 text-truncate" style={{maxWidth: '70%'}}>
            {project.title}
          </Card.Title>
          <Badge bg={project.status === 'RECRUITING' ? 'success' : 'secondary'} pill>
            {project.status}
          </Badge>
        </div>
        
        <Card.Subtitle className="mb-3 text-muted small">
          by @{project.owner.username}
        </Card.Subtitle>

        <Card.Text className="text-muted flex-grow-1" style={{ fontSize: '0.95rem' }}>
          {project.description.length > 100 
            ? `${project.description.substring(0, 100)}...` 
            : project.description}
        </Card.Text>

        <div className="mt-3">
          <div className="d-flex align-items-center mb-2 text-muted small">
            <FiUsers className="me-2" />
            <span>{project.membersCount} / {project.teamSizeNeeded} members</span>
          </div>
          
          <div className="d-flex flex-wrap gap-1 mb-3">
            {project.requiredSkills.slice(0, 3).map((skill, idx) => (
              <Badge key={idx} bg="light" text="dark" className="border fw-normal">
                {skill}
              </Badge>
            ))}
            {project.requiredSkills.length > 3 && (
              <Badge bg="light" text="dark" className="border fw-normal">
                +{project.requiredSkills.length - 3}
              </Badge>
            )}
          </div>
        </div>

        <Button 
          variant="outline-primary" 
          size="sm" 
          className="w-100 mt-auto d-flex align-items-center justify-content-center gap-2"
          onClick={() => navigate(`/projects/${project.id}`)}
        >
          View Details <FiArrowRight />
        </Button>
      </Card.Body>
    </Card>
  );
};

export default ProjectCard;
