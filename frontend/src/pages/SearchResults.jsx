import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Alert, Form, Button } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axiosConfig';
import ProjectCard from '../components/ProjectCard';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for Red-Black Tree range query parameters
  const [minSize, setMinSize] = useState('');
  const [maxSize, setMaxSize] = useState('');

  useEffect(() => {
    fetchResults();
  }, [query, minSize, maxSize]); // Refetch when query or range parameters change

  const fetchResults = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `/api/projects/search?q=${encodeURIComponent(query || '')}`;
      if (minSize) url += `&minSize=${minSize}`;
      if (maxSize) url += `&maxSize=${maxSize}`;
      
      const response = await api.get(url);
      setProjects(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch search results.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <h2 className="fw-bold mb-4">Search Results for "{query}"</h2>

      {/* Red-Black Tree Range Query Filter Panel */}
      <Row className="mb-4 align-items-end g-3 bg-white p-3 rounded-3 shadow-sm mx-0 border">
        <Col xs={12} md={4}>
          <h6 className="fw-bold mb-1 text-primary">Team Size range query (RBTree Index)</h6>
          <small className="text-secondary">Queries the backend Red-Black Tree range index in O(log N).</small>
        </Col>
        <Col xs={6} md={3}>
          <Form.Group>
            <Form.Label className="small fw-semibold text-secondary mb-1">Min Members Needed</Form.Label>
            <Form.Control
              type="number"
              placeholder="e.g. 1"
              min="1"
              value={minSize}
              onChange={(e) => setMinSize(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col xs={6} md={3}>
          <Form.Group>
            <Form.Label className="small fw-semibold text-secondary mb-1">Max Members Needed</Form.Label>
            <Form.Control
              type="number"
              placeholder="e.g. 5"
              min="1"
              value={maxSize}
              onChange={(e) => setMaxSize(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col xs={12} md={2}>
          <Button 
            variant="outline-danger" 
            className="w-100" 
            onClick={() => { setMinSize(''); setMaxSize(''); }}
            disabled={!minSize && !maxSize}
          >
            Clear Filters
          </Button>
        </Col>
      </Row>
      
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && projects.length === 0 && (
        <div className="text-center py-5 bg-white rounded-3 shadow-sm">
          <h4 className="text-muted">No matching projects found.</h4>
          <p className="text-secondary">Try adjusting your search terms or checking your spelling.</p>
        </div>
      )}

      {!loading && !error && projects.length > 0 && (
        <Row xs={1} md={2} lg={3} className="g-4">
          {projects.map(project => (
            <Col key={project.id}>
              <ProjectCard project={project} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default SearchResults;
