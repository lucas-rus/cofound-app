import React, { useState, useEffect } from 'react';
import { Navbar, Container, Nav, Dropdown, Button, Badge, OverlayTrigger, Popover, ListGroup } from 'react-bootstrap'; // Added OverlayTrigger, Popover, ListGroup
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiUser, FiGrid, FiPlusCircle, FiList, FiShield, FiUsers } from 'react-icons/fi';
import Avatar from './Avatar';
import api from '../api/axiosConfig'; // Added api import

const Layout = ({ children }) => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifData, setNotifData] = useState({ totalNetwork: 0, details: [] }); // Updated state

  useEffect(() => {
      if (user) {
          fetchNotifications();
          const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
          return () => clearInterval(interval);
      }
  }, [user]);

  const fetchNotifications = async () => {
      try {
          const res = await api.get('/api/notifications/counts');
          setNotifData(res.data);
      } catch (e) {
          console.error("Failed to fetch notifications");
      }
  };

  const popover = (
    <Popover id="popover-notifications">
      <Popover.Header as="h3">Notifications</Popover.Header>
      <Popover.Body className="p-0">
        <ListGroup variant="flush">
          {notifData.details.map((n, idx) => (
            <ListGroup.Item key={idx} className="small">
              <strong>{n.type}:</strong> {n.description}
            </ListGroup.Item>
          ))}
          {notifData.details.length === 0 && <ListGroup.Item>No new notifications</ListGroup.Item>}
        </ListGroup>
      </Popover.Body>
    </Popover>
  );

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
          <Navbar.Brand as={Link} to={user ? "/dashboard" : "/"} className="fw-bold fs-4">
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
                  <Nav.Link as={Link} to="/friends" className="d-flex align-items-center gap-2 position-relative">
                    <FiUsers /> My Network
                    {notifData.totalNetwork > 0 && (
                        <OverlayTrigger trigger={['hover', 'focus']} placement="bottom" overlay={popover}>
                            <Badge bg="danger" pill className="ms-1 cursor-pointer" style={{fontSize: '0.6rem'}}>
                                {notifData.totalNetwork}
                            </Badge>
                        </OverlayTrigger>
                    )}
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
                        <Avatar user={user} size={32} />
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
