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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [allRes, recRes, myProjRes, myAppsRes] = await Promise.all([
        api.get('/api/projects/available'),
        api.get('/api/projects/recommended'),
        api.get('/api/projects/my-projects'),
        api.get('/api/applications/my-applications')
      ]);

      const myProjectIds = new Set(myProjRes.data.map(p => p.id));
      const myAppIds = new Set(myAppsRes.data.map(a => a.project.id));

      // Filter Available: Not in my projects, not applied
      const filteredAvailable = allRes.data.filter(p => 
        !myProjectIds.has(p.id) && !myAppIds.has(p.id) && p.owner.id !== user.id
      );

      setAvailableProjects(filteredAvailable);
      setRecommended(recRes.data);
      setMyProjects(myProjRes.data);
    } catch (error) {
      console.error("Error fetching projects", error);
    } finally {
      setLoading(false);
    }
  };

  const filterList = (list) => list.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.requiredSkills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Dashboard</h2>
          <p className="text-muted mb-0">Manage your work and find new opportunities.</p>
        </div>
        
        <div style={{ maxWidth: '400px', width: '100%' }}>
          <InputGroup>
            <InputGroup.Text className="bg-white border-end-0">
              <FiSearch className="text-muted" />
            </InputGroup.Text>
            <Form.Control 
              placeholder="Search..." 
              className="border-start-0 ps-0 shadow-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
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
              {recommended.length > 0 && !searchTerm && (
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
              {filterList(availableProjects).length === 0 ? (
                <div className="text-center py-5 bg-white rounded-3 shadow-sm">
                  <h4 className="text-muted">No projects found.</h4>
                </div>
              ) : (
                <Row xs={1} md={2} lg={3} className="g-4">
                  {filterList(availableProjects).map(project => (
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
                 <div className="text-center py-5 bg-white rounded-3 shadow-sm">
                   <h4 className="text-muted">You are not part of any projects yet.</h4>
                   <Button variant="link" onClick={() => setActiveTab('explore')}>Find one now</Button>
                 </div>
               ) : filterList(myProjects).length === 0 ? (
                 <div className="text-center py-5 bg-white rounded-3 shadow-sm">
                   <h4 className="text-muted">No projects found matching "{searchTerm}".</h4>
                   <Button variant="link" onClick={() => setSearchTerm('')}>Clear Search</Button>
                 </div>
               ) : (
                 <Row xs={1} md={2} lg={3} className="g-4">
                   {filterList(myProjects).map(project => {
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
