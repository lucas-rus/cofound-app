import React, { useState } from 'react';
import { Navbar, Container, Nav, Dropdown, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiUser, FiGrid, FiPlusCircle, FiList, FiShield, FiUsers } from 'react-icons/fi';

const Layout = ({ children }) => {
  const { user, logout, loading } = useAuth(); // Add loading
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Don't show navbar on login/register pages usually, but let's keep it minimal
  // Also hide on root '/' to prevent flash during redirect
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/';

  return (
    <>
      <Navbar expand="lg" className="navbar-glass sticky-top mb-4">
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bold fs-4">
            <span className="text-primary">Co</span>Found
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {!loading && !isAuthPage && user && ( // Check loading
                <>
                  <Nav.Link as={Link} to="/dashboard" className="d-flex align-items-center gap-2">
                    <FiGrid /> Dashboard
                  </Nav.Link>
                  <Nav.Link as={Link} to="/my-applications" className="d-flex align-items-center gap-2">
                    <FiList /> My Applications
                  </Nav.Link>
                  <Nav.Link as={Link} to="/friends" className="d-flex align-items-center gap-2">
                    <FiUsers /> My Network
                  </Nav.Link>
                  {user.role === 'ROLE_ADMIN' && (
                    <Nav.Link as={Link} to="/admin" className="d-flex align-items-center gap-2 text-danger">
                      <FiShield /> Admin
                    </Nav.Link>
                  )}
                </>
              )}
            </Nav>
            
            <Nav>
              {!loading && ( // Wrap the right side in !loading check
                user ? (
                  <>
                    <Link to="/create-project" className="btn btn-primary-custom text-white me-3 d-flex align-items-center gap-2 text-decoration-none">
                      <FiPlusCircle /> Create Project
                    </Link>
                    <Dropdown align="end">
                      <Dropdown.Toggle variant="light" id="dropdown-basic" className="d-flex align-items-center gap-2 border-0 bg-transparent">
                        {user.profilePictureUrl ? (
                          <img 
                            src={user.profilePictureUrl} 
                            alt={user.username} 
                            className="rounded-circle border" 
                            style={{width: 32, height: 32, objectFit: 'cover'}}
                          />
                        ) : (
                          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: 32, height: 32}}>
                            {user.username?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                        <span className="fw-medium">{user.username || 'User'}</span>
                      </Dropdown.Toggle>

                      <Dropdown.Menu className="shadow-sm border-0">
                        <Dropdown.Item as={Link} to="/profile">
                          <FiUser className="me-2" /> Profile
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={handleLogout} className="text-danger">
                          <FiLogOut className="me-2" /> Logout
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </>
                ) : (
                  !isAuthPage && (
                    <>
                      <Link to="/login" className="nav-link fw-medium">Login</Link>
                      <Link to="/register" className="btn btn-primary-custom text-white ms-2">Get Started</Link>
                    </>
                  )
                )
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      
      <Container style={{ minHeight: '80vh' }}>
        {children}
      </Container>
      
      <footer className="text-center py-4 text-muted mt-5 border-top">
        <small>&copy; {new Date().getFullYear()} CoFound. Built for startup enthusiasts.</small>
      </footer>
    </>
  );
};

export default Layout;
