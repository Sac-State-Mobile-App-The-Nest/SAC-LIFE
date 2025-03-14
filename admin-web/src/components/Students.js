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
  const [editForm, setEditForm] = useState({ std_id: '', preferred_name: '', expected_grad: '', service_ids: [] });
  const [availableServices, setAvailableServices] = useState([]);
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
        response = await api.get('/students/preferredInfo', {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        if (error.response?.status === 401) {
          console.warn("Access token expired. Refreshing...");
          token = await refreshAccessToken();
          if (!token) return;
          response = await api.get('/students/preferredInfo', {
            headers: { Authorization: `Bearer ${token}` }
          });
        } else {
          throw error;
        }
      }
  
      let studentsData = response.data;
  
      // Fetch service IDs for each student
      const studentsWithServices = await Promise.all(
        studentsData.map(async (student) => {
          try {
            let serviceResponse = await api.get(
              `/campus_services/studentServices/${student.std_id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
  
            return { ...student, service_ids: serviceResponse.data.map(s => s.service_id) };
          } catch (error) {
            return { ...student, service_ids: [] };
          }
        })
      );
  
      setStudents(studentsWithServices);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  }, [navigate]);

  // Fetch all available services for dropdown
  const fetchAvailableServices = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/campus_services/getServIDAndName', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch services');
      const services = await response.json();
      setAvailableServices(services);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  }, []);

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
    fetchAvailableServices();
  }, [fetchStudents, getAdminRole, fetchAvailableServices]);

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
  
    try {
      await Promise.all(
        selectedStudents.map(async (stdId) => {
          try {
            const response = await api.delete(`/students/${stdId}`, {
              headers: { Authorization: `Bearer ${token}` },
              data: { password }
            });
            return response;
          } catch (error) {
            if (error.response?.status === 401) {
              console.warn("Access token expired. Refreshing...");
              token = await refreshAccessToken();
              if (!token) return;
              return api.delete(`/students/${stdId}`, {
                headers: { Authorization: `Bearer ${token}` },
                data: { password }
              });
            } else {
              throw error;
            }
          }
        })
      );
  
      alert("Selected students deleted successfully.");
      setStudents((prev) => prev.filter((student) => !selectedStudents.includes(student.std_id)));
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
      const response = await fetch(`http://localhost:5000/api/campus_services/studentServices/${user.std_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch student tags');
      }
      const serviceData = await response.json();
      // Assume serviceData is an array of objects with a tag_id property
      setEditForm({
        preferred_name: user.preferred_name,
        expected_grad: user.expected_grad,
        service_ids: serviceData.map(service => service.service_id)
      });
    } catch (error) {
      console.error("Error fetching student's tags:", error);
      setEditForm({
        preferred_name: user.preferred_name,
        expected_grad: user.expected_grad,
        service_ids: []
      });
    }
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
        response = await api.put(`/campus_services/studentTags/${editUser.std_id}`, editForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        if (error.response?.status === 401) {
          console.warn("Access token expired. Refreshing...");
          token = await refreshAccessToken();
          if (!token) return;
          response = await api.put(`/campus_services/studentTags/${editUser.std_id}`, editForm, {
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
                <td>{user.preferred_name}</td>
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
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>

            <label>Service Subscriptions:</label>
            <div className="service-checkbox-container">
              {availableServices.map((service) => (
                <label key={service.service_id} className="service-checkbox">
                  <input
                    type="checkbox"
                    value={service.service_id}
                    checked={editForm.service_ids.includes(service.service_id)}
                    onChange={(e) => {
                      const updatedServices = e.target.checked
                        ? [...editForm.service_ids, service.service_id]
                        : editForm.service_ids.filter((id) => id !== service.service_id);
                      setEditForm({ ...editForm, service_ids: updatedServices });
                    }}
                  />
                  {service.serv_name}
                </label>
              ))}
            </div>

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
