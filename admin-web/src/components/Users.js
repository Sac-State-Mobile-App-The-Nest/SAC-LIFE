import React, { useState, useEffect } from 'react';
import '../css/Users.css';

function Users() {
  const [users, setUsers] = useState([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [deleteUserId, setDeleteUserId] = useState(null);

  // Fetch users from the backend API when the component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  // Function to load users from the API
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/students'); // Adjust to your backend's URL
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token'); // Get the JWT token
      const response = await fetch(`http://localhost:5000/api/students/cascade-delete/${deleteUserId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Include the JWT token
        },
        body: JSON.stringify({ password }), // Send the password for re-authentication
      });

      if (response.ok) {
        setUsers(users.filter((user) => user.std_id !== deleteUserId));
        alert('Student deleted successfully');
      } else if (response.status === 401) {
        alert('Invalid password. Deletion not authorized.');
      } else {
        alert('Failed to delete student');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setShowPasswordModal(false); // Close modal
      setPassword(''); // Reset password field
      setDeleteUserId(null); // Clear user ID
    }
  };

  const openPasswordModal = (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this student?');
    if (!confirmDelete) return;

    setDeleteUserId(id); // Set the user ID for deletion
    setShowPasswordModal(true); // Open the modal
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.std_id}>
              <td>{user.f_name}</td>
              <td>{user.m_name}</td>
              <td>{user.l_name}</td>
              <td>{user.email}</td>
              <td className="users-buttons">
                <button>Edit</button>
                <button onClick={() => openPasswordModal(user.std_id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Password Confirmation Modal */}
      {showPasswordModal && (
        <div className="password-modal">
          <div className="password-modal-content">
            <h3>Enter Password</h3>
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
    </div>
  );
}

export default Users;