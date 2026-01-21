import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Basic protection (though ProtectedRoute should handle this, double check)
    if (user && user.role !== 'ROLE_ADMIN') {
      navigate('/dashboard');
      return;
    }

    fetchUsers();
  }, [user, navigate]);

        const fetchUsers = async () => {

          setError(''); // Clear previous errors

          try {

            const response = await api.get('/api/admin/users');

            setUsers(response.data);

          } catch (err) {

            console.error("Fetch users error:", err);

          setError('Failed to fetch users. You might not have permission.');
        } finally {
          setLoading(false);
        }
      };
    
          const toggleUserStatus = async (userId) => {
            setError(''); // Clear previous errors
            try {
              await api.put(`/api/admin/users/${userId}/toggle-status`);
              fetchUsers();
            } catch (err) {
              console.error("Toggle user status error:", err);
              let errorMessage = "Failed to update user status.";
              if (err.response) { // Check if a response object exists
                if (err.response.data) { // Prioritize specific data from backend
                  if (typeof err.response.data === 'string' && err.response.data.trim() !== '') {
                    errorMessage = err.response.data;
                  } else if (typeof err.response.data === 'object' && Object.keys(err.response.data).length > 0) {
                    errorMessage = Object.values(err.response.data)[0];
                  }
                } else if (err.response.statusText && err.response.statusText.trim() !== '') {
                  // Fallback to status text if data is empty but statusText exists
                  errorMessage = err.response.statusText;
                }
              } else if (err.message && err.message.trim() !== '') {
                // Fallback to general Axios error message (e.g., "Network Error")
                errorMessage = err.message;
              }
              setError(errorMessage);
            }
          };    
    const handleDeleteUser = async (userId, username) => {
      if (window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
        setError(''); // Clear previous errors
        try {
          await api.delete(`/api/admin/users/${userId}`);
          alert(`User "${username}" deleted successfully.`);
          fetchUsers(); // Refresh the user list
        } catch (err) {
          console.error("Delete user error:", err);
          let errorMessage = "Failed to delete user.";
          if (err.response) { // Check if a response object exists
            if (err.response.data) { // Prioritize specific data from backend
              if (typeof err.response.data === 'string' && err.response.data.trim() !== '') {
                errorMessage = err.response.data;
              } else if (typeof err.response.data === 'object' && Object.keys(err.response.data).length > 0) {
                errorMessage = Object.values(err.response.data)[0];
              }
            } else if (err.response.statusText && err.response.statusText.trim() !== '') {
              // Fallback to status text if data is empty but statusText exists
              errorMessage = err.response.statusText;
            }
          } else if (err.message && err.message.trim() !== '') {
            // Fallback to general Axios error message (e.g., "Network Error")
            errorMessage = err.message;
          }
          setError(errorMessage);
        }
      }
    };

      if (loading) {
        return (
          <div className="text-center mt-5">
            <Spinner animation="border" variant="primary" />
          </div>
        );
      }
    
      return (
        <Container className="mt-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Admin Dashboard</h2>
            <Badge bg="danger">Admin Access</Badge>
          </div>
    
          {error && <Alert variant="danger">{error}</Alert>}
    
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="card-title mb-3">System Users</h5>
              <Table responsive hover>
                              <thead>
                                <tr>
                                  <th>ID</th>
                                  <th>Username</th>
                                  <th>Email</th>
                                  <th>Status</th>
                                  <th>Actions</th>
                                  <th>Delete</th>
                                </tr>
                              </thead>
                              <tbody>
                                {users.map((u) => (
                                  <tr key={u.id}>
                                    <td>{u.id}</td>
                                    <td>
                                      <div className="d-flex align-items-center">
                                        <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-2" style={{width: 30, height: 30}}>
                                          {u.username.charAt(0).toUpperCase()}
                                        </div>
                                        {u.username}
                                      </div>
                                    </td>
                                    <td>{u.email}</td>
                                    <td>
                                      {u.enabled ? (
                                        <Badge bg="success">Active</Badge>
                                      ) : (
                                        <Badge bg="secondary">Disabled</Badge>
                                      )}
                                    </td>
                                    <td>
                                      {user && user.id !== u.id && ( // Prevent admin from toggling their own status
                                        <Button 
                                          variant={u.enabled ? "outline-danger" : "outline-success"} 
                                          size="sm" 
                                          onClick={() => toggleUserStatus(u.id)}
                                        >
                                          {u.enabled ? "Disable" : "Enable"}
                                        </Button>
                                      )}
                                    </td>
                                    <td>
                                      {user && user.id !== u.id && ( // Prevent admin from deleting themselves
                                        <Button 
                                          variant="danger" 
                                          size="sm" 
                                          onClick={() => handleDeleteUser(u.id, u.username)}
                                        >
                                          Delete
                                        </Button>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </div>
                        </div>
                      </Container>
                    );
                  };
                                  
                export default AdminDashboard;
                
