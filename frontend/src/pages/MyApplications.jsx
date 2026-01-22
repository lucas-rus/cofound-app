import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; // IMPORT useNavigate
import api from '../api/axiosConfig';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // HOOK

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const fetchMyApplications = async () => {
    try {
      const response = await api.get('/api/applications/my-applications');
      setApplications(response.data);
    } catch (error) {
      console.error("Error fetching applications", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACCEPTED': return <Badge bg="success">Accepted</Badge>;
      case 'REJECTED': return <Badge bg="danger">Rejected</Badge>;
      default: return <Badge bg="warning" text="dark">Pending</Badge>;
    }
  };

  const handleCardClick = (app) => {
      if (app.status !== 'REJECTED') {
          navigate(`/projects/${app.project.id}`);
      }
  };

  return (
    <Container className="py-4">
      <h2 className="fw-bold mb-4">My Applications</h2>
      
      {loading ? (
         <div className="text-center mt-5"><Spinner animation="border" /></div>
      ) : applications.length === 0 ? (
        <Card className="card-custom p-5 text-center">
          <h4 className="text-muted">You haven't applied to any projects yet.</h4>
        </Card>
      ) : (
        <Row xs={1} md={2} className="g-4">
          {applications.map(app => (
            <Col key={app.id}>
              <Card 
                className={`card-custom h-100 ${app.status !== 'REJECTED' ? 'shadow-hover' : 'opacity-75'}`}
                onClick={() => handleCardClick(app)}
                style={{ 
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: app.status !== 'REJECTED' ? 'pointer' : 'default'
                }}
              >
                <Card.Body>
                  <div className="d-flex justify-content-between mb-3">
                    <h5 className="fw-bold mb-0">{app.project.title}</h5>
                    {getStatusBadge(app.status)}
                  </div>
                  <p className="text-muted small mb-3">
                    Applied on: {new Date(app.appliedAt).toLocaleDateString()}
                  </p>
                  <p className="text-secondary text-truncate">
                    {app.project.description}
                  </p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default MyApplications;
