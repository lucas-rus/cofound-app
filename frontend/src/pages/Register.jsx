import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLock, FiUser, FiMail } from 'react-icons/fi';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const { register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    setError('');
    setMsg('');
    
    try {
      await register(formData.username, formData.email, formData.password);
      setMsg('Registration successful! Please check your email to verify your account.');
      setTimeout(() => navigate('/login'), 5000);
    } catch (err) {
      console.error("Registration error:", err);
      const status = err.response?.status || 'N/A';
      const statusText = err.response?.statusText || 'N/A';
      const data = typeof err.response?.data === 'object' ? JSON.stringify(err.response?.data) : (err.response?.data || 'No data');
      const msg = `Failed to register. Status: ${status} (${statusText}). Details: ${data}. Error: ${err.message}`;
      setError(msg);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <Row className="w-100 justify-content-center">
        <Col md={8} lg={5}>
          <div className="text-center mb-4">
            <h1 className="fw-bold text-primary">Join CoFound</h1>
            <p className="text-muted">Find the perfect team for your next big idea.</p>
          </div>
          <Card className="card-custom p-4">
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {msg && <Alert variant="success">{msg}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Username</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><FiUser className="text-muted"/></span>
                    <Form.Control 
                      name="username"
                      type="text" 
                      placeholder="Choose a username" 
                      value={formData.username} 
                      onChange={handleChange} 
                      required 
                      className="border-start-0 ps-0 bg-light"
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Email Address</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><FiMail className="text-muted"/></span>
                    <Form.Control 
                      name="email"
                      type="email" 
                      placeholder="name@example.com" 
                      value={formData.email} 
                      onChange={handleChange} 
                      required 
                      className="border-start-0 ps-0 bg-light"
                    />
                  </div>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium">Password</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0"><FiLock className="text-muted"/></span>
                        <Form.Control 
                          name="password"
                          type="password" 
                          placeholder="******" 
                          value={formData.password} 
                          onChange={handleChange} 
                          required 
                          className="border-start-0 ps-0 bg-light"
                        />
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-medium">Confirm</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0"><FiLock className="text-muted"/></span>
                        <Form.Control 
                          name="confirmPassword"
                          type="password" 
                          placeholder="******" 
                          value={formData.confirmPassword} 
                          onChange={handleChange} 
                          required 
                          className="border-start-0 ps-0 bg-light"
                        />
                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                <Button variant="primary" type="submit" className="w-100 btn-primary-custom mb-3">
                  Create Account
                </Button>
                
                <div className="text-center">
                  <span className="text-muted">Already have an account? </span>
                  <Link to="/login" className="text-decoration-none fw-bold">Log In</Link>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
