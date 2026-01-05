import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLock, FiUser } from 'react-icons/fi';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data || 'Failed to login');
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <Row className="w-100 justify-content-center">
        <Col md={6} lg={4}>
          <div className="text-center mb-4">
            <h1 className="fw-bold text-primary">CoFound</h1>
            <p className="text-muted">Welcome back! Please login to continue.</p>
          </div>
          <Card className="card-custom p-4">
            <Card.Body>
              {error && <Alert variant="danger" className="text-center">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBasicUsername">
                  <Form.Label className="fw-medium">Username</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><FiUser className="text-muted"/></span>
                    <Form.Control 
                      type="text" 
                      placeholder="Enter username" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)} 
                      required 
                      className="border-start-0 ps-0 bg-light"
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-4" controlId="formBasicPassword">
                  <Form.Label className="fw-medium">Password</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><FiLock className="text-muted"/></span>
                    <Form.Control 
                      type="password" 
                      placeholder="Password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                      className="border-start-0 ps-0 bg-light"
                    />
                  </div>
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 btn-primary-custom mb-3">
                  Log In
                </Button>
                
                <div className="text-center">
                  <span className="text-muted">Don't have an account? </span>
                  <Link to="/register" className="text-decoration-none fw-bold">Sign Up</Link>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
