import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../utils/navigationUtils';
import '../css/Users.css';
import { api, logoutAdmin } from '../api/api';

function AdminRoles() {
  // State variables
  const [admins, setAdmins] = useState([]);
  const [role, setRole] = useState(null);
  const [selectedAdmins, setSelectedAdmins] = useState([]);
  const [showBulkConfirmModal, setShowBulkConfirmModal] = useState(false);
  const [showBulkPasswordModal, setShowBulkPasswordModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [password, setPassword] = useState('');
  const [editAdmin, setEditAdmin] = useState(null);
  const [editForm, setEditForm] = useState({ username: '', role: '' });
  const navigate = useNavigate();

  // Fetches the list of admins from the backend and sets state
  const fetchAdmins = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("You must be logged in.");
        logoutAdmin(navigate);  
        return;
      }

      const response = await api.get('/adminRoutes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAdmins(response.data);
      if (Array.isArray(response.data) && response.data.length > 0) {
        setRole(response.data[0].role);
      } else {
        setRole(response.data.role || '');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        alert("Session expired. Please log in again.");
        logoutAdmin(navigate);
        return;
      }
      console.error('Error fetching admins:', error);
    }
  }, [navigate]);

  // Gets Admin Role from token
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
  }, [navigate]);

  // Calls fetchAdmins adn getAdminRole on component mount
  useEffect(() => {
    fetchAdmins();
    getAdminRole();
  }, [fetchAdmins, getAdminRole]);

  const handleCheckboxChange = (username) => {
    setSelectedAdmins((prevSelected) =>
      prevSelected.includes(username)
        ? prevSelected.filter((admin) => admin !== username)
        : [...prevSelected, username]
    );
  };

  // Handles "Select All" checkbox selection
  const handleSelectAllChange = (e) => {
    if (e.target.checked) {
      setSelectedAdmins(admins.map((admin) => admin.username));
    } else {
      setSelectedAdmins([]);
    }
  };

  // Ensures that the "Select All" checkbox is unchecked if not all admins are selected
  useEffect(() => {
    if (selectedAdmins.length !== admins.length) {
      document.querySelector("input[type='checkbox']").checked = false;
    }
  }, [selectedAdmins, admins]);

  // Uses delete api request to handle deleting admins by the checkboxes
  const handleBulkDelete = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("You must be logged in.");
      logoutAdmin(navigate);
      return;
    }
    try {
      await Promise.all(
        selectedAdmins.map(async (username) => {
          const response = await fetch(`http://localhost:5000/api/adminRoutes/${username}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password }),
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to delete admin ${username}`);
          }
        })
      );
      alert("Selected admins deleted successfully.");
      setAdmins((prev) => prev.filter((admin) => !selectedAdmins.includes(admin.username)));
      setSelectedAdmins([]);
    } catch (error) {
      console.error('Bulk deletion error:', error);
      alert(`Error deleting admins: ${error.message}`);
    } finally {
      setShowBulkPasswordModal(false);
      setShowBulkConfirmModal(false);
      setPassword('');
    }
  };


  // Opens the edit modal and sets form values for the selected admin
  const openEditModal = (admin) => {
    if (!admin || !admin.username) {
      console.error("Admin username is missing:", admin);
      alert("Error: Admin username is missing.");
      return;
    }
    setEditAdmin(admin);
    setEditForm({ username: admin.username, role: admin.role });
  };

  // Handles changes in the edit form fields
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

// Handles saving the edited admin
const handleSaveEdit = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("You must be logged in.");
      logoutAdmin();
      return;
    }

    const response = await api.put(`/adminRoutes/admin/${editAdmin.username}`, {
      newUsername: editForm.username,
      role: editForm.role,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status !== 200) {
      throw new Error('Failed to update admin');
    }

    alert("Admin updated successfully!");
    await fetchAdmins();
    setEditAdmin(null); 

  } catch (error) {
    if (error.response?.status === 401) {
      alert("Session expired. Please log in again.");
      logoutAdmin();
      return;
    }


    console.error('Error updating admin:', error);
    alert(`Error: ${error.message}`);
  }
};

// Filters the admins list based on the search term entered by the user
const filteredAdmins = admins.filter((admin) => {
  const term = searchTerm.toLowerCase();
  return (
    (admin.username ? admin.username.toLowerCase() : "").includes(term) ||
    (admin.role ? admin.role.toLowerCase() : "").includes(term)
  );
});

return (
  <div className="students-container">
    <BackButton />
    <h2>Admin List</h2>

    {/* Search input for filtering admins */}
    <input
      type="text"
      placeholder="Search admins..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="search-bar"
    />

    {/* Delete Selected button - Visible only for super-admins */}
    {role === 'super-admin' && (
      <button
        className="delete-selected-button"
        onClick={() => {
          if (selectedAdmins.length === 0) {
            alert("No admins selected.");
          } else {
            setShowBulkConfirmModal(true);
          }
        }}
      >
        Delete Selected
      </button>
    )}

    {/* Admins Table */}
    <table className="students-table">
      <thead>
        <tr>
          {/* Select All Checkbox */}
          <th>
            <input
              type="checkbox"
              onChange={handleSelectAllChange}
              checked={admins.length > 0 && selectedAdmins.length === admins.length}
            />
          </th>
          <th>Username</th>
          <th>Role</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {/* Display filtered admins */}
        {filteredAdmins.map((admin) => (
          <tr key={admin.username}>
            <td>
              {/* Checkbox for selecting individual admin */}
              <input
                type="checkbox"
                checked={selectedAdmins.includes(admin.username)}
                onChange={() => handleCheckboxChange(admin.username)}
              />
            </td>
            <td>{admin.username}</td>
            <td>{admin.role}</td>
            <td>
              {/* Show Edit button for super-admins and content managers */}
              {(role === 'super-admin' || role === 'content-manager') && (
                <button className="edit-button" onClick={() => openEditModal(admin)}>Edit</button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    {/* Bulk Deletion Confirmation Modal */}
    {showBulkConfirmModal && (
      <div className="modal">
        <div className="modal-content">
          <h3>Confirm Bulk Deletion</h3>
          <p>Are you sure you want to delete the selected admins?</p>
          <button onClick={() => { setShowBulkConfirmModal(false); setShowBulkPasswordModal(true); }}>Yes</button>
          <button onClick={() => setShowBulkConfirmModal(false)}>Cancel</button>
        </div>
      </div>
    )}

    {/* Bulk Deletion Password Confirmation Modal */}
    {showBulkPasswordModal && (
      <div className="modal">
        <div className="modal-content">
          <h3>Confirm Bulk Delete</h3>
          <p>Enter your password to confirm deletion:</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleBulkDelete}>Confirm Delete</button>
          <button onClick={() => setShowBulkPasswordModal(false)}>Cancel</button>
        </div>
      </div>
    )}

    {/* Edit Admin Modal */}
    {editAdmin && (
      <div className="modal">
        <div className="modal-content">
          <h3>Edit Admin</h3>
          <label>
            Username:
            <input
              type="text"
              name="username"
              value={editForm.username}
              onChange={handleEditChange}
            />
          </label>
          <label>
            Role:
            <input
              type="text"
              name="role"
              value={editForm.role}
              onChange={handleEditChange}
            />
          </label>
          <button onClick={handleSaveEdit}>Save</button>
          <button onClick={() => setEditAdmin(null)}>Cancel</button>
        </div>
      </div>
    )}
  </div>
);
}
export default AdminRoles;