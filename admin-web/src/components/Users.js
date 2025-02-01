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

      if (!token) {
        alert("You must be logged in to delete a student.");
        return;
    }

      console.log("Token being sent:", token); // Log token to check

      const response = await fetch(`http://localhost:5000/api/adminRoutes/students/${deleteUserId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Include the JWT token
        },
        body: JSON.stringify({ password }), // Send the password for re-authentication
      });

      const result = await response.json();
      console.log("🔹 Server Response:", result);

      if (response.ok) {
        setUsers(users.filter((user) => user.std_id !== deleteUserId));
        alert('Student deleted successfully');
      } else if (response.status === 401) {
        alert('Invalid password. Deletion not authorized.');
      } else if (response.status === 403) {
        alert(result.message || "Invalid role: You do not have permission to delete students.");
      } else {
        alert(`Failed to delete student: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('An error occurred while deleting the student.');
    } finally {
      setShowPasswordModal(false); // Close modal
      setPassword(''); // Reset password field
      setDeleteUserId(null); // Clear user ID
    }
  };

  const openPasswordModal = (id) => {
    const token = localStorage.getItem('token'); // Get the JWT token
    if (!token) {
        alert("You must be logged in to delete a student.");
        return;
    }

    // Decode JWT token to check the role
    const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decodes the payload of the JWT

    if (decodedToken.role !== 'super-admin') {
        alert("Invalid role: Only super-admins can delete students.");
        return;
    }

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