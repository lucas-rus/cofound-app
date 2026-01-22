import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link, Navigate } from 'react-router-dom';
import { FiUsers, FiTarget, FiTrendingUp, FiAward, FiSmile, FiBriefcase } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="landing-page bg-light">
      {/* Hero Section */}
      <section className="py-5 text-center container">
        <div className="row py-lg-5">
          <div className="col-lg-8 col-md-10 mx-auto">
            <h1 className="fw-bold display-3 mb-3 text-dark">
              Build your dream team with <span className="text-dark"><span className="text-primary">Co</span>Found</span>
            </h1>
            <p className="lead text-secondary mb-5">
              The ultimate platform for founders to connect, collaborate, and launch startup ideas. 
              Find the perfect partner who shares your vision and complements your skills.
            </p>
            <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
              <Link to="/register" className="btn btn-primary btn-lg px-4 gap-3 rounded-pill shadow-sm">Get Started</Link>
              <Link to="/login" className="btn btn-outline-secondary btn-lg px-4 rounded-pill">Log In</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-5 bg-white shadow-sm position-relative" style={{ zIndex: 1 }}>
        <Container>
            <div className="text-center mb-5">
                <h2 className="fw-bold display-6">Our Vision</h2>
                <p className="text-muted fs-5">Creating a fair environment for innovation.</p>
            </div>
            <Row className="g-4 justify-content-center">
                <Col md={4}>
                    <div className="text-center p-4 h-100 rounded-3">
                        <div className="feature-icon bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '70px', height: '70px'}}>
                            <FiAward size={32}/>
                        </div>
                        <h4 className="fw-bold mb-3">Innovation First</h4>
                        <p className="text-secondary">
                            We connect like-minded people to collaborate purely for the purpose of innovation. 
                            We promise that every idea is valued, heard, and rewarded.
                        </p>
                    </div>
                </Col>
                <Col md={4}>
                    <div className="text-center p-4 h-100 rounded-3">
                        <div className="feature-icon bg-success bg-opacity-10 text-success rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '70px', height: '70px'}}>
                            <FiSmile size={32}/>
                        </div>
                        <h4 className="fw-bold mb-3">Peer Collaboration</h4>
                        <p className="text-secondary">
                            Unlike freelance markets with bosses and unrealistic expectations, we offer a level playing field. 
                            No bosses—just peers with ideas teaming up with other skilled peers.
                        </p>
                    </div>
                </Col>
                <Col md={4}>
                    <div className="text-center p-4 h-100 rounded-3">
                        <div className="feature-icon bg-warning bg-opacity-10 text-warning rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '70px', height: '70px'}}>
                            <FiBriefcase size={32}/>
                        </div>
                        <h4 className="fw-bold mb-3">Build Your Portfolio</h4>
                        <p className="text-secondary">
                            Perfect for students and early-career pros. Even if a project doesn't become the next unicorn, 
                            you gain invaluable experience and a tangible portfolio piece to help you stand out.
                        </p>
                    </div>
                </Col>
            </Row>
        </Container>
      </section>

      {/* Features Section */}
      <Container className="py-5" id="features">
        <h2 className="text-center fw-bold mb-5 display-6">Why Choose Us?</h2>
        <Row className="g-4 py-3 row-cols-1 row-cols-lg-3">
          <Col>
            <Card className="h-100 border-0 shadow-hover transition-card text-center p-4" style={{transition: 'transform 0.3s'}}>
              <Card.Body>
                <div className="mb-3 text-primary">
                  <FiUsers size={40}/>
                </div>
                <h3 className="fs-4 fw-bold">Smart Matching</h3>
                <p className="text-muted">
                  Connect with potential co-founders based on complementary skills, interests, and commitment levels.
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card className="h-100 border-0 shadow-hover transition-card text-center p-4" style={{transition: 'transform 0.3s'}}>
              <Card.Body>
                <div className="mb-3 text-success">
                  <FiTarget size={40}/>
                </div>
                <h3 className="fs-4 fw-bold">Project Validation</h3>
                <p className="text-muted">
                  Share your ideas, get feedback, and build a team around validated concepts before writing a single line of code.
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card className="h-100 border-0 shadow-hover transition-card text-center p-4" style={{transition: 'transform 0.3s'}}>
              <Card.Body>
                <div className="mb-3 text-info">
                  <FiTrendingUp size={40}/>
                </div>
                <h3 className="fs-4 fw-bold">Growth Tools</h3>
                <p className="text-muted">
                  Manage your project's lifecycle, track milestones, and keep your team aligned with integrated dashboard tools.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Call to Action */}
      <section className="py-5 bg-primary bg-gradient text-white">
        <Container className="text-center">
          <h2 className="fw-bold mb-3 display-5">Ready to launch?</h2>
          <p className="lead mb-4 opacity-75">Join a community of founders building the future today.</p>
          <Link to="/register" className="btn btn-light btn-lg px-5 rounded-pill shadow fw-bold text-primary">Join CoFound Now</Link>
        </Container>
      </section>
    </div>
  );
};

export default LandingPage;