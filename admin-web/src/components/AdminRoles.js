import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Users.css';
import { api, logoutAdmin } from '../api/api';

function AdminRoles() {
  const [admins, setAdmins] = useState([]);
  const [role, setRole] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [deleteAdmin, setDeleteAdmin] = useState(null);
  const [editAdmin, setEditAdmin] = useState(null);
  const [editForm, setEditForm] = useState({ username: '', password: '', role: '' });
  const navigate = useNavigate();

  // Fetches the list of admins from the backend and sets state
  const fetchAdmins = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("You must be logged in.");
        logoutAdmin(navigate);  
        return;
      }

      const response = await api.get('/adminRoutes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("API Response:", response.data);
      setAdmins(response.data);

      // If response.data is an array, extract the role from the first item
    if (Array.isArray(response.data) && response.data.length > 0) {
      setRole(response.data[0].role);
    } else {
      setRole(response.data.role || '');
    }
      
    } catch (error) {
      if (error.response?.status === 401) {
        alert("Session expired. Please log in again.");
        logoutAdmin(navigate);
        return;
      }
      console.error('Error fetching admins:', error);
    }
  }, [[navigate]]);

  // Calls fetchAdmins on component mount
  useEffect(() => {
    fetchAdmins();
    getAdminRole();
  }, []);

  // Get admin role from token
  const getAdminRole = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const base64Payload = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(base64Payload));
        setRole(decodedPayload.role);
      } catch (error) {
        console.error("Error decoding token:", error);
        logoutAdmin(navigate);
      }
    }
  };
  
  // Opens the delete confirmation modal for a selected admin
  const openPasswordModal = (username) => {
    if (role !== 'super-admin') {
      alert("Invalid role: Only super-admins can delete admins.");
      logoutAdmin(navigate);
      return;
    }

    if (window.confirm('Are you sure you want to delete this admin?')) {
      setDeleteAdmin(username);
      setShowPasswordModal(true);
    }
  };

  // Handles the deletion of an admin
  const handleDeleteAdmin = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("You must be logged in.");
        logoutAdmin(navigate);
        return;
      }

      const response = await fetch(`http://localhost:5000/api/adminRoutes/${deleteAdmin}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.status === 401) {
        alert("Session expired. Please log in again.");
        logoutAdmin(navigate);
        return;
      }

      if (response.ok) {
        alert("Admin deleted successfully.");
        setAdmins(admins.filter(admin => admin.username !== deleteAdmin));
      } else {
        const result = await response.json();
        alert(`Failed to delete admin: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      alert("An error occurred while deleting the admin.");
    } finally {
      setShowPasswordModal(false);
      setPassword('');
      setDeleteAdmin(null);
    }
  };

  // Opens the edit modal and sets form values for the selected admin
  const openEditModal = (admin) => {
    if (!admin || !admin.username) {
      console.error("Admin username is missing:", admin);
      alert("Error: Admin username is missing.");
      return;
    }
    setEditAdmin(admin);
    setEditForm({ username: admin.username, role: admin.role });
  };

  // Handles changes in the edit form fields
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const goBackPage = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/"); 
    }
  };

// Handles saving the edited admin
const handleSaveEdit = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("You must be logged in.");
      logoutAdmin();
      return;
    }

    const response = await fetch(`http://localhost:5000/api/adminRoutes/${editAdmin.username}`, {
      method: 'PUT', 
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        newUsername: editForm.username,
        role: editForm.role
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update admin');
    }

    alert("Admin updated successfully!");
    await fetchAdmins();
    setEditAdmin(null); 

  } catch (error) {
    if (error.response?.status === 401) {
      alert("Session expired. Please log in again.");
      logoutAdmin();
      return;
    }


    console.error('Error updating admin:', error);
    alert(`Error: ${error.message}`);
  }
};

return (
  <div className="students-container">
    {/* Previous Page Button */}   
    <button className="back-button" onClick={goBackPage}>Go Back</button>

    <h2>Admin List</h2>
    <table className="students-table">
      <thead>
        <tr>
          <th>Username</th>
          <th>Role</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {admins.map((admin) => (
          <tr key={admin.id}>
            <td>{admin.username}</td>
            <td>{admin.role}</td>
            {role !== 'read-only' && (
              <td>
                <button className="edit-button" onClick={() => openEditModal(admin)}>Edit</button>
                {role === 'super-admin' && (
                  <button className="delete-button" onClick={() => openPasswordModal(admin.username)}>Delete</button>
                )}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>

     {/* Delete Confirmation Modal */}
     {showPasswordModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Confirm Delete</h3>
            <p>Enter your password to confirm deletion:</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" onClick={handleDeleteAdmin}>Confirm Delete</button>
            <button type="button" onClick={() => setShowPasswordModal(false)}>Cancel</button>
          </div>
        </div>
      )}

    {/* Edit Admin Modal */}
    {editAdmin && (
      <div className="modal">
        <div className="modal-content">
          <h3>Edit Admin</h3>
          <form>
            <label>
              Username:
              <input
                name="username"
                value={editForm.username}
                onChange={handleEditChange}
              />
            </label>
            <label>
              Role:
              <input
                name="role"
                value={editForm.role}
                onChange={handleEditChange}
              />
            </label>
            <button type="button" onClick={handleSaveEdit}>Save</button>
            <button type="button" onClick={() => setEditAdmin(null)}>Cancel</button>
          </form>
        </div>
      </div>
    )}
  </div>
);
}

export default AdminRoles;