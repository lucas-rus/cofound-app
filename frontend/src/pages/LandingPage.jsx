import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link, Navigate } from 'react-router-dom';
import { FiUsers, FiTarget, FiTrendingUp } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="py-5 text-center container">
        <div className="row py-lg-5">
          <div className="col-lg-8 col-md-10 mx-auto">
            <h1 className="fw-bold display-3 mb-3">
              Build your dream team with <span className="text-dark"><span className="text-primary">Co</span>Found</span>
            </h1>
            <p className="lead text-muted mb-5">
              The ultimate platform for founders to connect, collaborate, and launch startup ideas. 
              Find the perfect partner who shares your vision and complements your skills.
            </p>
            <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
              <Link to="/register" className="btn btn-primary btn-lg px-4 gap-3">Get Started</Link>
              <Link to="/login" className="btn btn-outline-secondary btn-lg px-4">Log In</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section (NEW) */}
      <section className="py-5 bg-white border-bottom">
        <Container>
            <Row className="justify-content-center">
                <Col lg={8} className="text-center">
                    <h2 className="fw-bold mb-4">Our Mission</h2>
                    <p className="text-muted fs-5 mb-4">
                        Creating an environment for like-minded people to connect and collaborate for the purpose of innovation, 
                        and with the promise that every idea will be taken into account & rewarded.
                    </p>
                    <p className="text-secondary">
                        CoFound is a competitor to platforms like Upwork and Fiverr, but with a key difference: 
                        instead of an intensely competitive market with unrealistic expectations, we offer a way to team up easily with like-minded and similarly skilled peers. 
                        There are no "bosses" here—just people with ideas joining others with ideas.
                    </p>
                    <p className="text-secondary">
                        We specifically aim to support students and early-career professionals who want to build their portfolio. 
                        In today's tough job market, CoFound offers a platform to start a project, gain experience, and connect with people who understand 
                        that the journey and the portfolio additions are just as valuable as the potential startup success.
                    </p>
                </Col>
            </Row>
        </Container>
      </section>

      {/* Features Section */}
      <Container className="py-5" id="features">
        <h2 className="text-center fw-bold mb-5">Why Choose Us?</h2>
        <Row className="g-4 py-5 row-cols-1 row-cols-lg-3">
          <Col>
            <Card className="h-100 border-0 shadow-sm text-center p-4">
              <Card.Body>
                <div className="feature-icon bg-primary bg-gradient text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                  <FiUsers size={28}/>
                </div>
                <h3 className="fs-4 fw-bold">Smart Matching</h3>
                <p>
                  Connect with potential co-founders based on complementary skills, interests, and commitment levels.
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card className="h-100 border-0 shadow-sm text-center p-4">
              <Card.Body>
                <div className="feature-icon bg-success bg-gradient text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                  <FiTarget size={28}/>
                </div>
                <h3 className="fs-4 fw-bold">Project Validation</h3>
                <p>
                  Share your ideas, get feedback, and build a team around validated concepts before writing a single line of code.
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card className="h-100 border-0 shadow-sm text-center p-4">
              <Card.Body>
                <div className="feature-icon bg-info bg-gradient text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                  <FiTrendingUp size={28}/>
                </div>
                <h3 className="fs-4 fw-bold">Growth Tools</h3>
                <p>
                  Manage your project's lifecycle, track milestones, and keep your team aligned with integrated dashboard tools.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Call to Action */}
      <section className="py-5 bg-light">
        <Container className="text-center">
          <h2 className="fw-bold mb-3">Ready to launch?</h2>
          <p className="lead text-muted mb-4">Join thousands of founders building the future today.</p>
          <Link to="/register" className="btn btn-primary btn-lg">Join CoFound Now</Link>
        </Container>
      </section>
    </div>
  );
};

export default LandingPage;
