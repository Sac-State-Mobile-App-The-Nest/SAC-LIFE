import React, { useState, useEffect } from 'react';
import '../css/Users.css';
import { useUsers } from './Users';

function AdminRoles() {
   const [admins, setAdmins] = useState([]); // ✅ Fix state variable
   const [role, setRole] = useState(null); 
   const [showPasswordModal, setShowPasswordModal] = useState(false);
   const [password, setPassword] = useState('');
   const [deleteAdmin, setDeleteAdmin] = useState(null);
   const [editAdmin, setEditAdmin] = useState(null); 
   const [editForm, setEditForm] = useState({ username: '', password: '', role: '' });

  useEffect(() => {
      fetchAdmins();
    }, []);

  // Auto logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setRole(null);
    alert("Session expired. Please log in again.");
    window.location.href = "/login"; 
  };

  const fetchAdmins = async () =>{
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("You must be logged in.");
        return;
      }

      const response = await fetch('http://localhost:5000/api/adminRoutes',{
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
        }
      });
    
      if (response.status === 401) {
        alert("Session expired. Please log in again.");
        logout(); 
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch admins');
      }
  

      const data = await response.json();
      setAdmins(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("You must be logged in to delete an admin.");
        return;
      }
  
      const response = await fetch(`http://localhost:5000/api/adminRoutes/admins/${deleteAdmin}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });
  
      const result = await response.json();
      console.log("Server Response:", result);
  
      if (response.ok) {
        setAdmins(admins.filter((admin) => admin.username !== deleteAdmin));
        alert(`Admin '${deleteAdmin}' deleted successfully`);
      } else if (response.status === 401) {
        alert('Invalid password. Deletion not authorized.');
      } else if (response.status === 403) {
        alert(result.message || "Invalid role: You do not have permission to delete admins.");
      } else {
        alert(`Failed to delete admin: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      alert('An error occurred while deleting the admin.');
    } finally {
      setShowPasswordModal(false);
      setPassword('');
      setDeleteAdmin(null);
    }
  };

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
        setRole(null);
      }
    }
  };

  // Open delete modal
  const openPasswordModal = (id) => {
    if (role !== 'super-admin') {
      alert("Invalid role: Only super-admins can delete admins.");
      return;
    }

    const confirmDelete = window.confirm('Are you sure you want to delete this admin?');
    if (!confirmDelete) return;

    setDeleteAdmin(username);
    setShowPasswordModal(true);
  };

  // Open edit modal
  const openEditModal = (admin) => {
    setEditAdmin(admin);
    setEditForm({ username: admin.username, role: admin.role });
  };

  // Handle input change in edit form
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Handle editing admin
  const handleEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("You must be logged in to edit an admin.");
        return;
      }

      const response = await fetch(`http://localhost:5000/api/adminRoutes/admins/${editAdmin.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      const result = await response.json();
      if (response.ok) {
        alert('Admin updated successfully');
        fetchAdmins(); // Refresh admin list
        setEditAdmin(null); // Close modal
      } else {
        alert(`Failed to update admin: ${result.message}`);
      }
    } catch (error) {
      console.error('Error updating admin:', error);
      alert('An error occurred while updating the admin.');
    }
  };

  return (
    <div className="users-container"> 
      <h2>Admin List</h2>
      <table className="users-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Role</th>
            {role === 'super-admin' && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {admins.map((admin) => (
            <tr key={admin.id}>
              <td>{admin.username}</td>
              <td>{admin.role}</td>
              {role !== 'read-only' && (
                <td className="users-buttons">
                  {role !== 'support-admin' && (
                    <button onClick={() => openEditModal(admin)}>Edit</button>
                  )}
                  {role === 'super-admin' && (
                    <button onClick={() => openPasswordModal(admin.id)}>Delete</button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Password Confirmation Modal for Delete */}
    {showPasswordModal && (
      <div className="password-modal">
        <div className="password-modal-content">
          <h3>Enter Password to Confirm Deletion</h3>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="password-modal-actions">
            <button onClick={handleDelete}>Confirm</button>
            <button onClick={() => setShowPasswordModal(false)}>Cancel</button>
          </div>
        </div>
      </div>
    )}

      {/* Edit Admin Modal */}
      {editAdmin && (
        <div className="edit-modal">
          <div className="edit-modal-content">
            <h3>Edit Admin</h3>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={editForm.username}
              onChange={handleEditChange}
            />
            <select
              name="role"
              value={editForm.role}
              onChange={handleEditChange}
            >
              <option value="super-admin">Super Admin</option>
              <option value="content-manager">Content Manager</option>
              <option value="support-admin">Support Admin</option>
              <option value="read-only">Read Only</option>
            </select>
            <div className="edit-modal-actions">
              <button onClick={handleEdit}>Save</button>
              <button onClick={() => setEditAdmin(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminRoles;