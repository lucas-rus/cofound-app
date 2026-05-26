import React, { useEffect, useState } from 'react';
import { Row, Col, Form, InputGroup, Tabs, Tab, Badge, Button } from 'react-bootstrap';
import api from '../api/axiosConfig';
import ProjectCard from '../components/ProjectCard';
import PendingReviews from '../components/PendingReviews';
import { FiSearch, FiFilter } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [availableProjects, setAvailableProjects] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('explore');
  
  // State for Red-Black Tree range query parameters
  const [minSize, setMinSize] = useState('');
  const [maxSize, setMaxSize] = useState('');

  // Fetch initial non-search data on mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch search results from backend dynamically when search query or filters change
  useEffect(() => {
    fetchAvailableProjects();
  }, [searchTerm, minSize, maxSize]);

  const fetchInitialData = async () => {
    try {
      const [recRes, myProjRes] = await Promise.all([
        api.get('/api/projects/recommended'),
        api.get('/api/projects/my-projects')
      ]);
      setRecommended(recRes.data);
      setMyProjects(myProjRes.data);
    } catch (error) {
      console.error("Error fetching initial data", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableProjects = async () => {
    try {
      let url = `/api/projects/search?q=${encodeURIComponent(searchTerm || '')}`;
      if (minSize) url += `&minSize=${minSize}`;
      if (maxSize) url += `&maxSize=${maxSize}`;

      const [searchRes, myProjRes, myAppsRes] = await Promise.all([
        api.get(url),
        api.get('/api/projects/my-projects'),
        api.get('/api/applications/my-applications')
      ]);

      const myProjectIds = new Set(myProjRes.data.map(p => p.id));
      const myAppIds = new Set(myAppsRes.data.map(a => a.project.id));

      // Filter: Not in my projects, not applied
      const filteredAvailable = searchRes.data.filter(p => 
        !myProjectIds.has(p.id) && !myAppIds.has(p.id) && p.owner.id !== user.id
      );

      setAvailableProjects(filteredAvailable);
    } catch (error) {
      console.error("Error searching projects", error);
    }
  };

  // Simple client-side search helper for "My Projects" tab
  const filterMyProjects = (list) => list.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Dashboard</h2>
          <p className="text-muted mb-0">Manage your work and find new opportunities.</p>
        </div>
        
        <div className="d-flex align-items-center gap-3 flex-wrap flex-md-nowrap" style={{ maxWidth: '650px' }}>
          {/* Flat Minimalist Team Size Filter */}
          <div className="d-flex align-items-center gap-1">
            <span className="text-secondary fw-semibold small me-1">Team Size:</span>
            <Form.Control 
              type="number" 
              placeholder="Min" 
              min="1"
              value={minSize}
              onChange={(e) => setMinSize(e.target.value)}
              className="border-0 border-bottom bg-transparent rounded-0 p-0 text-center shadow-none" 
              style={{ width: '38px', fontSize: '0.85rem', borderBottom: '1.5px solid #ced4da' }}
            />
            <span className="text-muted small">-</span>
            <Form.Control 
              type="number" 
              placeholder="Max" 
              min="1"
              value={maxSize}
              onChange={(e) => setMaxSize(e.target.value)}
              className="border-0 border-bottom bg-transparent rounded-0 p-0 text-center shadow-none" 
              style={{ width: '38px', fontSize: '0.85rem', borderBottom: '1.5px solid #ced4da' }}
            />
          </div>

          <div className="text-muted opacity-50 d-none d-md-block">|</div>

          {/* Flat Search Bar */}
          <InputGroup style={{ maxWidth: '280px' }}>
            <InputGroup.Text className="bg-transparent border-0 pe-1">
              <FiSearch className="text-muted" />
            </InputGroup.Text>
            <Form.Control 
              placeholder="Search..." 
              className="border-0 border-bottom bg-transparent rounded-0 ps-1 shadow-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ borderBottom: '1.5px solid #ced4da' }}
            />
          </InputGroup>
          
          {(minSize || maxSize || searchTerm) && (
            <Button 
              variant="link" 
              className="text-danger p-0 text-decoration-none small ms-2" 
              onClick={() => { setMinSize(''); setMaxSize(''); setSearchTerm(''); }}
              style={{ fontSize: '0.85rem' }}
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      <PendingReviews />

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4 custom-tabs">
        <Tab eventKey="explore" title="Explore">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
            </div>
          ) : (
            <>
              {/* Recommended Section */}
              {recommended.length > 0 && !searchTerm && !minSize && !maxSize && (
                <div className="mb-5">
                  <h4 className="fw-bold mb-3 text-primary">Recommended for You</h4>
                  <Row xs={1} md={2} lg={3} className="g-4">
                    {recommended.slice(0, 3).map(project => (
                      <Col key={project.id}>
                        <ProjectCard project={project} />
                      </Col>
                    ))}
                  </Row>
                  <hr className="my-5" />
                </div>
              )}

              <h4 className="fw-bold mb-3">Available Projects</h4>
              {availableProjects.length === 0 ? (
                <div className="text-center py-5 bg-white rounded-3 shadow-sm border">
                  <h4 className="text-muted">No projects found.</h4>
                  <p className="text-secondary mb-0">Try adjusting your keyword or team size filters.</p>
                </div>
              ) : (
                <Row xs={1} md={2} lg={3} className="g-4">
                  {availableProjects.map(project => (
                    <Col key={project.id}>
                      <ProjectCard project={project} />
                    </Col>
                  ))}
                </Row>
              )}
            </>
          )}
        </Tab>

        <Tab eventKey="my-projects" title={<>My Projects <Badge bg="secondary" pill>{myProjects.length}</Badge></>}>
           {loading ? (
             <div className="text-center py-5"><div className="spinner-border text-primary"/></div>
           ) : (
             <>
               {myProjects.length === 0 ? (
                 <div className="text-center py-5 bg-white rounded-3 shadow-sm border">
                   <h4 className="text-muted">You are not part of any projects yet.</h4>
                   <Button variant="link" onClick={() => setActiveTab('explore')}>Find one now</Button>
                 </div>
               ) : filterMyProjects(myProjects).length === 0 ? (
                 <div className="text-center py-5 bg-white rounded-3 shadow-sm border">
                   <h4 className="text-muted">No projects found matching "{searchTerm}".</h4>
                   <Button variant="link" onClick={() => setSearchTerm('')}>Clear Search</Button>
                 </div>
               ) : (
                 <Row xs={1} md={2} lg={3} className="g-4">
                   {filterMyProjects(myProjects).map(project => {
                     const storedCount = parseInt(localStorage.getItem(`msg_count_${project.id}`) || '0');
                     const newMessages = Math.max(0, project.messageCount - storedCount);
                     const pendingApps = project.owner.id === user.id ? project.pendingApplicationsCount : 0;
                     
                     return (
                       <Col key={project.id}>
                         <ProjectCard project={project} newMessages={newMessages} pendingApps={pendingApps} />
                       </Col>
                     );
                   })}
                 </Row>
               )}
             </>
           )}
        </Tab>
      </Tabs>
    </div>
  );
};

export default Dashboard;
