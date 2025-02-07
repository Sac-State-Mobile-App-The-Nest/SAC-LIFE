import React, { useState, useEffect } from 'react';
import '../css/Users.css';

function Users() {
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState(null); // Add role state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [editUser, setEditUser] = useState(null); 
  const [editForm, setEditForm] = useState({ f_name: '', m_name: '', l_name: '', email: '' });

  
  useEffect(() => {
    fetchUsers();
    getUserRole();
  }, []);

  // Auto logout function
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  setRole(null);
  alert("Session expired. Please log in again.");
  window.location.href = "/login"; // Redirect to login page
};

  // Function to load users from the API
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
        logout(); // Auto logout when the token is expired
        return;
      }
  
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

   // Function to get the role from the token
   const getUserRole = () => {
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
      console.log("Server Response:", result);

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
      setShowPasswordModal(false); 
      setPassword(''); 
      setDeleteUserId(null); 
    }
  };

  const openPasswordModal = (id) => {
    if (role !== 'super-admin') {
      alert("Invalid role: Only super-admins can delete students.");
      return;
    }

    const confirmDelete = window.confirm('Are you sure you want to delete this student?');
    if (!confirmDelete) return;

    setDeleteUserId(id); 
    setShowPasswordModal(true); 
  };


  const openEditModal = (user) => {
    setEditUser(user);
    setEditForm({ f_name: user.f_name, m_name: user.m_name, l_name: user.l_name, email: user.email });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };


  const handleEdit = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        alert("You must be logged in to edit a student.");
        return;
      }

    const response = await fetch(`http://localhost:5000/api/adminRoutes/students/${editUser.std_id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
    });

    const result = await response.json();
    if (response.ok) {
        alert('Student updated successfully');
        fetchUsers(); // Refresh the user list
        setEditUser(null); // Close modal
    } else {
        alert(`Failed to update student: ${result.message}`);
    }
   } catch (error) {
        console.error('Error updating student:', error);
        alert('An error occurred while updating the student.');
    }

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

      {editUser && (
          <div className="edit-modal">
              <div className="edit-modal-content">
                  <h3>Edit Student</h3>
                  <input type="text" name="f_name" placeholder="First Name" value={editForm.f_name} onChange={handleEditChange} />
                  <input type="text" name="m_name" placeholder="Middle Name" value={editForm.m_name} onChange={handleEditChange} />
                  <input type="text" name="l_name" placeholder="Last Name" value={editForm.l_name} onChange={handleEditChange} />
                  <input type="email" name="email" placeholder="Email" value={editForm.email} onChange={handleEditChange} />
                  <div className="edit-modal-actions">
                      <button onClick={handleEdit}>Save</button>
                      <button onClick={() => setEditUser(null)}>Cancel</button>
                  </div>
              </div>
          </div>
      )}

    </div>

    
    
  );
}

export default Users;