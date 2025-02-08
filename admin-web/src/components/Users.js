import React, { useState, useEffect } from 'react';
import '../css/Users.css';

function Users() {
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ f_name: '', m_name: '', l_name: '', email: '' });

  // Fetches users from the API and sets state
  useEffect(() => {
    fetchUsers();
    getAdminRole();
  }, []);

  // Logs out the user by clearing local storage and redirecting
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setRole(null);
    alert("Session expired. Please log in again.");
    window.location.href = "/login";
  };

  // Fetches users from the API
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("You must be logged in.");
        return;
      }

      const response = await fetch('http://localhost:5000/api/students');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      if (response.status === 401) {
        alert("Session expired. Please log in again.");
        logout();
        return;
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Retrieves admin role from stored token
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

  // Handles user deletion
  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("You must be logged in to delete a student.");
        return;
      }

      const response = await fetch(`http://localhost:5000/api/adminRoutes/students/${deleteUserId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();

      if (response.ok) {
        setUsers(users.filter((user) => user.std_id !== deleteUserId));
        alert('Student deleted successfully');
      } else {
        alert(`Failed to delete student: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('An error occurred while deleting the student.');
    } finally {
      setShowPasswordModal(false);
      setPassword('');
      setDeleteUserId(null);
    }
  };

  // Opens delete confirmation modal
  const openPasswordModal = (id) => {
    if (role !== 'super-admin') {
      alert("Invalid role: Only super-admins can delete students.");
      return;
    }
    if (window.confirm('Are you sure you want to delete this student?')) {
      setDeleteUserId(id);
      setShowPasswordModal(true);
    }
  };

  // Opens edit modal with user data
  const openEditModal = (user) => {
    setEditUser(user);
    setEditForm({ f_name: user.f_name, m_name: user.m_name, l_name: user.l_name, email: user.email });
  };

  // Handles form input changes
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  return (
    <div className="users-container">
      <h2>Users</h2>
      <table className="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Middle Name</th>
            <th>Last Name</th>
            <th>Email</th>
            {role === 'super-admin' && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.std_id}>
              <td>{user.f_name}</td>
              <td>{user.m_name}</td>
              <td>{user.l_name}</td>
              <td>{user.email}</td>
              {role !== 'read-only' && (
                <td className="users-buttons">
                  {role !== 'support-admin' && (
                    <button onClick={() => openEditModal(user)}>Edit</button>
                  )}
                  {role === 'super-admin' && (
                    <button onClick={() => openPasswordModal(user.std_id)}>Delete</button>
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

export default Users;
