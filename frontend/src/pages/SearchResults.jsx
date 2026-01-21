import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axiosConfig';
import ProjectCard from '../components/ProjectCard';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (query) {
      fetchResults();
    } else {
      setProjects([]);
    }
  }, [query]);

  const fetchResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/projects/search?q=${encodeURIComponent(query)}`);
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
