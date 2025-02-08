import React, { useState, useEffect, useCallback } from 'react';
import '../css/Users.css';

function AdminRoles() {
  const [admins, setAdmins] = useState([]);
  const [role, setRole] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [deleteAdmin, setDeleteAdmin] = useState(null);
  const [editAdmin, setEditAdmin] = useState(null);
  const [editForm, setEditForm] = useState({ username: '', password: '', role: '' });

  // Fetches the list of admins from the backend and sets state
  const fetchAdmins = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("You must be logged in.");
        return;
      }

      const response = await fetch('http://localhost:5000/api/adminRoutes', {
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
  }, []);

  // Calls fetchAdmins on component mount
  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // Logs out the user by clearing local storage and redirecting
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setRole(null);
    alert("Session expired. Please log in again.");
    window.location.href = "/login";
  };

  // Opens the delete confirmation modal for a selected admin
  const openPasswordModal = (username) => {
    if (role !== 'super-admin') {
      alert("Invalid role: Only super-admins can delete admins.");
      return;
    }
    if (window.confirm('Are you sure you want to delete this admin?')) {
      setDeleteAdmin(username);
      setShowPasswordModal(true);
    }
  };

  // Opens the edit modal and sets form values for the selected admin
  const openEditModal = (admin) => {
    setEditAdmin(admin);
    setEditForm({ username: admin.username, role: admin.role });
  };

  // Handles changes in the edit form fields
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
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
                <td>
                  <button onClick={() => openEditModal(admin)}>Edit</button>
                  {role === 'super-admin' && (
                    <button onClick={() => openPasswordModal(admin.username)}>Delete</button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminRoles;
