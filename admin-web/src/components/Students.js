import React, { useState, useEffect, useCallback } from 'react';
import '../css/Users.css';
import { useNavigate } from 'react-router-dom';
import { logoutAdmin } from '../api/api';

function Students() {
  const [students, setStudents] = useState([]);
  const [role, setRole] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ f_name: '', m_name: '', l_name: '', email: '' });
  const navigate = useNavigate();


  // Fetch students from API
  const fetchStudents = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("You must be logged in.");
        logoutAdmin(navigate);
        return;
      }

      const response = await fetch('http://localhost:5000/api/students', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        alert("Session expired. Please log in again.");
        logoutAdmin(navigate);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  }, [navigate]);

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

  useEffect(() => {
    fetchStudents();
    getAdminRole();
  }, [fetchStudents, getAdminRole]);

  // Handle user deletion
  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('admintoken');
      if (!token) {
        alert("You must be logged in to delete a student.");
        logoutAdmin(navigate);
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

      if (response.status === 401) {
        alert("Session expired. Please log in again.");
        logoutAdmin(navigate);  
        return;
      }
  

      if (response.ok) {
        setStudents(students.filter((user) => user.std_id !== deleteUserId));
        alert('Student deleted successfully');
      } else {
        const result = await response.json();
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

  // Open delete confirmation modal
  const openPasswordModal = (id) => {
    if (role !== 'super-admin') {
      alert("Invalid role: Only super-admins can delete students.");
      logoutAdmin(navigate);
      return;
    }
    setDeleteUserId(id);
    setShowPasswordModal(true);
  };

  // Open edit modal with user data
  const openEditModal = (user) => {
    setEditUser(user);
    setEditForm({ f_name: user.f_name, m_name: user.m_name, l_name: user.l_name, email: user.email });
  };

  // Handle form input changes
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Handle saving the edited user
  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("You must be logged in.");
        logoutAdmin(navigate);
        return;
      }

      const response = await fetch(`http://localhost:5000/api/students/${editUser.std_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.status === 401) {
        alert("Session expired. Please log in again.");
        logoutAdmin();  
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update student');
      }

      alert("Student updated successfully!");
      await fetchStudents();
      setEditUser(null); 
    } catch (error) {
      console.error('Error updating student:', error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="students-container">
      <h2>Students</h2>
      <table className="students-table">
        <thead>
          <tr>
            <th>First Name</th>
            <th>Middle Name</th>
            <th>Last Name</th>
            {role === 'super-admin' && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {students.map((user) => (
            <tr key={user.std_id}>
              <td>{user.f_name}</td>
              <td>{user.m_name}</td>
              <td>{user.l_name}</td>
              {role !== 'read-only' && (
                <td>
                  {role !== 'support-admin' && (
                    <button className="edit-button" onClick={() => openEditModal(user)}>Edit</button>
                  )}
                  {role === 'super-admin' && (
                    <button className="delete-button" onClick={() => openPasswordModal(user.std_id)}>Delete</button>
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
            <button type="button" onClick={handleDelete}>Confirm Delete</button>
            <button type="button" onClick={() => setShowPasswordModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Student</h3>
            <form>
              <label>
                First Name:
                <input name="f_name" value={editForm.f_name} onChange={handleEditChange} />
              </label>
              <label>
                Middle Name:
                <input name="m_name" value={editForm.m_name} onChange={handleEditChange} />
              </label>
              <label>
                Last Name:
                <input name="l_name" value={editForm.l_name} onChange={handleEditChange} />
              </label>
              <label>
                Email:
                <input name="email" value={editForm.email} onChange={handleEditChange} />
              </label>
              <button type="button" onClick={handleSaveEdit}>Save</button>
              <button type="button" onClick={() => setEditUser(null)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Students;
