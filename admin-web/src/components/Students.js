import React, { useState, useEffect, useCallback } from 'react';
import '../css/Users.css';
import BackButton from '../utils/navigationUtils';
import { useNavigate } from 'react-router-dom';
import { logoutAdmin } from '../api/api';

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

  // Fetches students from the backend, including their associated services
  const fetchStudents = useCallback(async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("You must be logged in.");
            logoutAdmin(navigate);
            return;
        }
        // Fetch basic student info
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

        let studentsData = await response.json();

        // Fetch service IDs for each student
        const studentsWithServices = await Promise.all(
            studentsData.map(async (student) => {
                try {
                    const serviceResponse = await fetch(
                        `http://localhost:5000/api/campus_services/studentServices/${student.std_id}`,
                        {
                            headers: { Authorization: `Bearer ${token}` }, 
                        }
                    );

                    if (serviceResponse.status === 401) {
                        return { ...student, service_ids: [] };
                    }

                    const services = serviceResponse.ok ? await serviceResponse.json() : [];
                    return { ...student, service_ids: services.map(service => service.service_id) };
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
      const token = localStorage.getItem('token');
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

  // Handle service selection change
  const handleServiceChange = (e) => {
    const selectedServiceIds = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    setEditForm({ ...editForm, service_ids: selectedServiceIds });
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

  // Filters the students list based on the search term entered by the user
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
  
      {/* Search Bar for filtering students */}
      <input
        type="text"
        placeholder="Search students..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />
  
      {/* Only Super Admins can delete students */}
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
  
      {/* Table Container with Scroll for Large Lists */}
      <div style={{ maxHeight: "400px", overflowY: "auto", width: "100%" }}>
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
              <th>Service IDs</th>
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
                <td>
                  {user.service_ids.length > 0 ? user.service_ids.join(', ') : <i>No services</i>}
                </td>
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
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Student</h3>
            <form>
              <label>
                Preferred Name:
                <input
                  name="preferred_name"
                  value={editForm.preferred_name}
                  onChange={handleEditChange}
                />
              </label>
              <label>
                Expected Graduation:
                <input
                  name="expected_grad"
                  value={editForm.expected_grad}
                  onChange={handleEditChange}
                />
              </label>
              <label>
                Service IDs:
                <select multiple value={editForm.service_ids} onChange={handleServiceChange}>
                  {availableServices.map(service => (
                    <option key={service.service_id} value={service.service_id}>
                      {service.serv_name}
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
