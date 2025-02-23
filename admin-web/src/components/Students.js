import React, { useState, useEffect, useCallback } from 'react';
import '../css/Users.css';
import BackButton from '../utils/NavigationUtils';
import { useNavigate } from 'react-router-dom';
import { logoutAdmin } from '../api/api';

function Students() {
  const [students, setStudents] = useState([]);
  const [role, setRole] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]); 
  const [showBulkConfirmModal, setShowBulkConfirmModal] = useState(false); 
  const [showBulkPasswordModal, setShowBulkPasswordModal] = useState(false); 
  const [searchTerm, setSearchTerm] = useState("");
  const [password, setPassword] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ std_id: '', preferred_name: '', expected_grad: '', tags: [] });
  const [availableTags, setAvailableTags] = useState([]);
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

      const response = await fetch('http://localhost:5000/api/students/preferredInfo', {
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

  const fetchTags = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("You must be logged in.");
        logoutAdmin(navigate);
        return;
      }
      const response = await fetch('http://localhost:5000/api/campus_services', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch campus services');
      
      const data = await response.json();
      const formattedTags = data.map(service => ({
        tag_id: service.service_id,
        tag_name: service.serv_name
      }));
      setAvailableTags(data);
    } catch (error) {
      console.error('Error fetching campus services:', error);
    }
  }, [navigate]);
  
  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  // Get admin role from token
  const getAdminRole = useCallback(() => {
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
  },[navigate]);


  useEffect(() => {
    fetchStudents();
    getAdminRole();
  }, [fetchStudents, getAdminRole]);

  // Toggle checkbox for a single student
  const handleCheckboxChange = (id) => {
    setSelectedStudents(prevSelected =>
      prevSelected.includes(id)
        ? prevSelected.filter(item => item !== id)
        : [...prevSelected, id]
    );
  };

  // Toggle "Select All" checkbox
  const handleSelectAllChange = (e) => {
    if (e.target.checked) {
      setSelectedStudents(students.map(student => student.std_id));
    } else {
      setSelectedStudents([]);
    }
  };

  // Handle bulk deletion by sending DELETE requests for each selected student
  const handleBulkDelete = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("You must be logged in.");
      logoutAdmin(navigate);
      return;
    }
    try {
      // Map over selected student IDs and send a DELETE request for each.
      const deletionPromises = selectedStudents.map(async (stdId) => {
        const response = await fetch(`http://localhost:5000/api/adminRoutes/students/${stdId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ password }),
        });
        if (!response.ok) {
          const result = await response.json();
          throw new Error(`Failed to delete student ${stdId}: ${result.message || 'Unknown error'}`);
        }
      });
      await Promise.all(deletionPromises);
      alert("Selected students deleted successfully.");
      // Remove deleted students from the list.
      setStudents(prev => prev.filter(student => !selectedStudents.includes(student.std_id)));
      setSelectedStudents([]);
    } catch (error) {
      console.error('Bulk deletion error:', error);
      alert(`Error deleting students: ${error.message}`);
    } finally {
      setShowBulkPasswordModal(false);
      setShowBulkConfirmModal(false);
      setPassword('');
    }
  };

  // Open edit modal with user data
  const openEditModal = async (user) => {
    setEditUser(user);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("You must be logged in.");
        logoutAdmin(navigate);
        return;
      }
      const response = await fetch(`http://localhost:5000/api/campus_services/studentTags/${user.std_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch student tags');
      }
      const tagData = await response.json();
      // Assume tagData is an array of objects with a tag_id property
      setEditForm({
        preferred_name: user.preferred_name,
        expected_grad: user.expected_grad,
        tags: tagData.map(tag => tag.tag_id)
      });
    } catch (error) {
      console.error("Error fetching student's tags:", error);
      setEditForm({
        preferred_name: user.preferred_name,
        expected_grad: user.expected_grad,
        tags: []
      });
    }
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

      const response = await fetch(`http://localhost:5000/api/campus_services/studentTags/${editUser.std_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.status === 401) {
        alert("Session expired. Please log in again.");
        logoutAdmin(navigate);  
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

  const filteredStudents = students.filter((student) => {
    const term = searchTerm.toLowerCase();
  
    return (
      (student.preferred_name ? student.preferred_name.toLowerCase() : "").includes(term) ||
      (student.std_id && student.std_id.toString().includes(term))
    );
  });

  return (
    <div className="students-container">
      <BackButton />
      <h2>Students</h2>

       {/* Search Bar */}
      <input
        type="text"
        placeholder="Search students..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />

      {role === 'super-admin' && (
        <div className="students-buttons">
          <button
            className="delete-selected-button"
            onClick={() => {
              if (selectedStudents.length === 0) {
                alert("No students selected.");
              } else {
                setShowBulkConfirmModal(true);
              }
            }}
          >
            Delete Selected
          </button>
        </div>
      )}
      <table className="students-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={handleSelectAllChange}
                checked={students.length > 0 && selectedStudents.length === students.length}
              />
            </th>
            <th>Student ID</th>
            <th>Preferred Name</th>
            <th>Expected Graduation</th>
            {role === 'super-admin' && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map((user) => (
            <tr key={user.std_id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(user.std_id)}
                  onChange={() => handleCheckboxChange(user.std_id)}
                />
              </td>
              <td>{user.std_id}</td>
              <td>{user.preferred_name}</td>
              <td>{user.expected_grad}</td>
              {role !== 'read-only' && (
                <td>
                  {role !== 'support-admin' && (
                    <button className="edit-button" onClick={() => openEditModal(user)}>Edit</button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

       {/* Bulk Confirmation Modal: Ask if user is sure */}
       {showBulkConfirmModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Confirm Bulk Deletion</h3>
            <p>Are you sure you want to delete the selected students?</p>
            <button
              type="button"
              onClick={() => {
                setShowBulkConfirmModal(false);
                setShowBulkPasswordModal(true); // Proceed to password prompt
              }}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => {
                setShowBulkConfirmModal(false);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

     {/* Bulk Password Modal: Enter password to confirm deletion */}
     {showBulkPasswordModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Confirm Bulk Delete</h3>
            <p>Enter your password to confirm deletion of the selected students:</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" onClick={handleBulkDelete}>Confirm Delete</button>
            <button
              type="button"
              onClick={() => {
                setShowBulkPasswordModal(false);
                setPassword('');
              }}
            >
              Cancel
            </button>
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
                Preferred Name:
                <input  
                  name="preferred_name" 
                  value={editForm.preferred_name} 
                  onChange={handleEditChange} />
              </label>
              <label>
                Expected Graduation:
                <input 
                  name="expected_grad" 
                  value={editForm.expected_grad} 
                  onChange={handleEditChange} />
              </label>
              <label>
                Service Tags:
                <select
                  name="tags"
                  multiple
                  value={editForm.tags}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setEditForm(prev => ({ ...prev, tags: selected }));
                  }}
                >
                  {availableTags.map(tag => (
                    <option key={tag.tag_id} value={tag.tag_id}>
                      {tag.tag_name}
                    </option>
                  ))}
                </select>
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
