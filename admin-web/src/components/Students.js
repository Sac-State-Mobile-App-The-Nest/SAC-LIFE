import React, { useState, useEffect, useCallback } from 'react';
import '../css/Users.css';
import BackButton from '../utils/navigationUtils';
import { useNavigate } from 'react-router-dom';
import { api, logoutAdmin, refreshAccessToken } from '../api/api';

function Students() {
  // State variables
  const [students, setStudents] = useState([]);
  const [role, setRole] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]); 
  const [showBulkConfirmModal, setShowBulkConfirmModal] = useState(false); 
  const [showBulkPasswordModal, setShowBulkPasswordModal] = useState(false); 
  const [searchTerm, setSearchTerm] = useState("");
  const [password, setPassword] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ std_id: '', preferred_name: '', expected_grad: '' });
  const navigate = useNavigate();

  const fetchStudents = useCallback(async () => {
    try {
      let token = sessionStorage.getItem('token');
      if (!token) {
        alert("You must be logged in.");
        logoutAdmin(navigate);
        return;
      }
  
      let response;
      try {
        response = await api.get('/students/studentInfo', {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        if (error.response?.status === 401) {
          console.warn("Access token expired. Refreshing...");
          token = await refreshAccessToken();
          if (!token) return;
          response = await api.get('/students/studentInfo', {
            headers: { Authorization: `Bearer ${token}` }
          });
        } else {
          throw error;
        }
      }
  
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  }, [navigate]);

  // Get admin role from token
  const getAdminRole = useCallback(() => {
    const token = sessionStorage.getItem('token');
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

  // Fetch students, admin role, and available services from the backend on component mount
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

  const handleBulkDelete = async () => {
    let token = sessionStorage.getItem('token');
    if (!token) {
      alert("You must be logged in.");
      logoutAdmin(navigate);
      return;
    }
  
    const deleteStudents = async (tokenToUse) => {
      const skipped = [];
  
      await Promise.all(
        selectedStudents.map(async (stdId) => {
          try {
            await api.request({
              url: `adminRoutes/students/${stdId}`,
              method: 'delete',
              headers: { Authorization: `Bearer ${tokenToUse}` },
              data: { password },
            });
          } catch (error) {
            if (error.response?.status === 404) {
              console.warn(`Student ${stdId} already deleted.`);
              skipped.push(stdId);
            } else {
              throw error;
            }
          }
        })
      );
  
      return skipped;
    };
  
    try {
      try {
        await deleteStudents(token);
      } catch (error) {
        if (error.response?.status === 401) {
          console.warn("Token expired, attempting refresh...");
          token = await refreshAccessToken();
          token = sessionStorage.getItem('token');
          if (!token) throw new Error("Token refresh failed.");
          await deleteStudents(token);
        } else {
          throw error;
        }
      }
  
      alert("Selected students deleted successfully.");
      setStudents((prev) =>
        prev.filter((student) => !selectedStudents.includes(student.std_id))
      );
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

  const openEditModal = async (user) => {
    setEditUser(user);
    setEditForm({
      preferred_name: user.preferred_name,
      expected_grad: user.expected_grad
    });
  };

  // Handle form input changes
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };


  const handleSaveEdit = async () => {
    try {
      let token = sessionStorage.getItem('token');
      if (!token) {
        alert("You must be logged in.");
        logoutAdmin(navigate);
        return;
      }
  
      let response;
      try {
        response = await api.put(`/adminRoutes/student/${editUser.std_id}`, {
          preferred_name: editForm.preferred_name,
          expected_grad: editForm.expected_grad
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        if (error.response?.status === 401) {
          console.warn("Access token expired. Refreshing...");
          token = await refreshAccessToken();
          if (!token) return;
          response = await api.put(`/adminRoutes/student/${editUser.std_id}`, {
            preferred_name: editForm.preferred_name,
            expected_grad: editForm.expected_grad
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } else {
          throw error;
        }
      }
  
      alert("Student updated successfully!");
      await fetchStudents();
      setEditUser(null);
    } catch (error) {
      console.error('Error updating student:', error);
      alert(`Error: ${error.message}`);
    }
  };

  // Filters the students list based on the search term entered by the user
  const filteredStudents = students.filter((student) => {
    const term = searchTerm.toLowerCase();
  
    return (
      (student.preferred_name ? student.preferred_name.toLowerCase() : "").includes(term) ||
      (student.std_id && student.std_id.toString().includes(term))
    );
  });

  return (
    <div className="users-container">
      <BackButton />
      <h2>Students</h2>
  
      {/* Search Bar for filtering students */}
      <input
        type="text"
        placeholder="Search students..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />
  
      {/* Table Container with Scroll for Large Lists */}
      <div className="scrollable-table-container">
        <table className="users-table">
        <thead>
        <tr>
          {/* Checkbox Header with Delete Button Inside */}
          <th className="checkbox-header">
            {role === 'super-admin' && (
              <button
                className="delete-selected-button"
                onClick={() => setShowBulkConfirmModal(true)}
                disabled={selectedStudents.length === 0}
                style={{
                  opacity: selectedStudents.length === 0 ? 0.5 : 1,
                  cursor: selectedStudents.length === 0 ? "not-allowed" : "pointer",
                }}
              >
                Delete Selected
              </button>
            )}
            <input
              type="checkbox"
              onChange={handleSelectAllChange}
              checked={students.length > 0 && selectedStudents.length === students.length}
            />
          </th>
          <th>First Name</th>
          <th>Last Name</th>
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
                <td>{`${user.f_name}`}</td>
                <td>{`${user.l_name}`}</td>
                <td>{user.preferred_name}</td>
                {/* <td>{user.preferred_name}</td> */}
                <td>{user.expected_grad}</td>
                {role !== 'read-only' && (
                  <td>
                    {role !== 'support-admin' && (
                      <button className="edit-button" onClick={() => openEditModal(user)}>
                        Edit
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  
      {/* Bulk Confirmation Modal - Ask if the user is sure */}
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
  
      {/* Bulk Password Modal - Enter password to confirm deletion */}
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
  
      {/* Edit Student Modal */}
      {editUser && (
        <div className="edit-modal">
          <div className="edit-modal-content">
            <h3>Edit Student</h3>

            <label>Preferred Name:</label>
            <input
              type="text"
              name="preferred_name"
              value={editForm.preferred_name}
              onChange={handleEditChange}
            />

            <label>Expected Graduation:</label>
            <select
            name="expected_grad"
            value={editForm.expected_grad}
            onChange={handleEditChange}
          >
            <option value="">Select Year</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
            <option value="2028">2028</option>
          </select>


            <div className="edit-modal-actions">
              <button className="save-button" onClick={handleSaveEdit}>
                Save
              </button>
              <button className="cancel-button" onClick={() => setEditUser(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default Students;
