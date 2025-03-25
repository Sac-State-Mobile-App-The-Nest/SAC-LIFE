import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../utils/navigationUtils';
import '../css/Users.css';
import { api, logoutAdmin, refreshAccessToken } from '../api/api';

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
  const [editForm, setEditForm] = useState({ username: '', role: '', is_active: true });
  const [createAdminModal, setCreateAdminModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ username: "", password: "", role: "super-admin" });
  const [auditLogs, setAuditLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const navigate = useNavigate();

  const fetchAuditLogs = useCallback(async () => {
    try {
      let token = sessionStorage.getItem("token");
      if (!token) {
        logoutAdmin(navigate);
        return;
      }
  
      let response;
      try {
        response = await api.get("/adminRoutes/audit-logs", {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        if (error.response?.status === 401) {
          token = await refreshAccessToken();
          if (!token) return;
          response = await api.get("/adminRoutes/audit-logs", {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          throw error;
        }
      }
  
      setAuditLogs(response.data);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
      alert("Failed to load audit logs.");
    }
  }, [navigate]);

  const fetchAdmins = useCallback(async () => {
    try {
      let token = sessionStorage.getItem('token');
      if (!token) {
        alert("You must be logged in.");
        logoutAdmin(navigate);  
        return;
      }
  
      let response;
      try {
        response = await api.get('/adminRoutes', {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        if (error.response?.status === 401) {
          console.warn("Access token expired. Trying refresh...");
          token = await refreshAccessToken();  // Refresh token
          if (!token) return;  // Logout if refresh fails
          response = await api.get('/adminRoutes', {
            headers: { Authorization: `Bearer ${token}` }
          });
        } else {
          throw error;
        }
      }
  
      setAdmins(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  }, [navigate]);

  // Gets Admin Role from token
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
  }, [navigate]);

  // Calls fetchAdmins adn getAdminRole on component mount
  useEffect(() => {
    fetchAdmins();
    getAdminRole();
  }, [fetchAdmins, getAdminRole]);

  useEffect(() => {
    if (showLogs) {
      fetchAuditLogs();
    }
  }, [showLogs, fetchAuditLogs]);

   // Handles form input change
   const handleInputChange = (e) => {
    setNewAdmin({ ...newAdmin, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (username) => {
    setSelectedAdmins((prevSelected) =>
      prevSelected.includes(username)
        ? prevSelected.filter((admin) => admin !== username)
        : [...prevSelected, username]
    );
  };

  const handleCreateAdmin = async () => {
    if (!newAdmin.username || !newAdmin.password) {
      alert("Please fill in all fields.");
      return;
    }
    
    try {
      let token = sessionStorage.getItem('token');
      if (!token) {
        alert("You must be logged in.");
        logoutAdmin(navigate);
        return;
      }
  
      let response;
      try {
        response = await api.post("/adminRoutes/create", { ...newAdmin }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        if (error.response?.status === 401) {
          console.warn("Access token expired. Trying refresh...");
          token = await refreshAccessToken();
          if (!token) return;
          response = await api.post("/adminRoutes/create", { ...newAdmin }, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          throw error;
        }
      }
  
      if (response.status === 201) {
        alert("Admin created successfully!");
        fetchAdmins();
        setCreateAdminModal(false);
        setNewAdmin({ username: "", password: "", role: "admin" });
      } else {
        alert("Failed to create admin.");
      }
    } catch (error) {
      console.error("Error creating admin:", error);
      alert("Error: Unable to create admin.");
    }
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

  const handleBulkDelete = async () => {
    let token = sessionStorage.getItem('token');
    if (!token) {
      alert("You must be logged in.");
      logoutAdmin(navigate);
      return;
    }
  
    try {
      await Promise.all(
        selectedAdmins.map(async (username) => {
          try {
            const response = await api.delete(`/adminRoutes/${username}`, {
              headers: { Authorization: `Bearer ${token}` },
              data: { password },
            });
            return response;
          } catch (error) {
            if (error.response?.status === 401) {
              console.warn("Access token expired. Trying refresh...");
              token = await refreshAccessToken();
              if (!token) return;
              return api.delete(`/adminRoutes/${username}`, {
                headers: { Authorization: `Bearer ${token}` },
                data: { password },
              });
            } else {
              throw error;
            }
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
    setEditForm({ username: admin.username, role: admin.role, is_active: admin.is_active });
  };

  // Handles changes in the edit form fields
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSaveEdit = async () => {
    try {
      let token = sessionStorage.getItem('token');
      if (!token) {
        alert("You must be logged in.");
        logoutAdmin();
        return;
      }
    
      let response;
      try {
        response = await api.put(`/adminRoutes/admin/${editAdmin.username}`, {
          newUsername: editForm.username,
          role: editForm.role,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        if (error.response?.status === 401) {
          console.warn("Access token expired. Trying refresh...");
          token = await refreshAccessToken();
          if (!token) return;
          response = await api.put(`/adminRoutes/admin/${editAdmin.username}`, {
            newUsername: editForm.username,
            role: editForm.role,
          }, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          throw error;
        }
      }
  
      alert("Admin updated successfully!");
      await fetchAdmins();
      setEditAdmin(null);
    } catch (error) {
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

const handleToggleActive = async () => {
  try {
    let token = sessionStorage.getItem('token');
    if (!token) {
      alert("You must be logged in.");
      logoutAdmin(navigate);
      return;
    }

    const updatedStatus = !editForm.is_active;

    const response = await api.put(`/adminRoutes/admin/deactivate/${editAdmin.username}`, {
      is_active: updatedStatus
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.status === 200) {
      alert(`Admin ${updatedStatus ? 'activated' : 'deactivated'} successfully!`);

      // ✅ Wait for latest admins list first
      const refreshedAdmins = await fetchAdmins();

      // ✅ Then use the freshly updated data
      const refreshed = refreshedAdmins.find((a) => a.username === editForm.username);
      if (refreshed) {
        setEditForm({
          username: refreshed.username,
          role: refreshed.role,
          is_active: refreshed.is_active
        });
      } else {
        // fallback if not found
        setEditForm(prev => ({
          ...prev,
          is_active: updatedStatus
        }));
      }

    } else {
      alert('Failed to update admin status.');
    }
  } catch (error) {
    console.error('Error updating admin status:', error);
    alert('An error occurred. Please try again.');
  }
};

return (
  <div className="users-container">
    <BackButton />
    <h2>Admin List</h2>

    {/* Create Admin Button (Visible to Super-Admins Only) */}
    {role === "super-admin" && (
        <button className="create-admin-button" onClick={() => setCreateAdminModal(true)}>
          + Create Admin
        </button>
      )}

    {/* Search input for filtering admins */}
    <input
      type="text"
      placeholder="Search admins..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="search-bar"
    />

    {/* Admins Table */}
    <div style={{ maxHeight: "400px", overflowY: "auto", width: "100%" }}>
    <table className="users-table">
      <thead>
        <tr>
          {/* Checkbox Header with Delete Button Inside */}
          <th className="checkbox-header">
            <button
              className="delete-selected-button"
              onClick={() => {setShowBulkConfirmModal(true);}}
              disabled={selectedAdmins.length === 0}
              style={{
                opacity: selectedAdmins.length === 0 ? 0.5 : 1,
                cursor: selectedAdmins.length === 0 ? "not-allowed" : "pointer",
              }}
            >
              Delete Selected
            </button>
            <input
              type="checkbox"
              onChange={handleSelectAllChange}
              checked={admins.length > 0 && selectedAdmins.length === admins.length}
            />
          </th>
          <th>Username</th>
          <th>Role</th>
          <th>Account Status</th>
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
            <td style={{ color: admin.is_active ? "green" : "red" }}>
              {admin.is_active ? "Active" : "Inactive"}
            </td>
            <td>
              {(role === 'super-admin' || role === 'content-manager') && (
                <button className="edit-button" onClick={() => openEditModal(admin)}>Edit</button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* Audit Logs Section (visible to super-admins only) */}
  {role === "super-admin" && (
      <>
        <button
          className="audit-toggle-button"
          onClick={() => setShowLogs((prev) => !prev)}
          style={{ marginTop: "1rem" }}
        >
          {showLogs ? "Hide Audit Logs" : "View Audit Logs"}
        </button>

        {showLogs && (
          <div style={{ marginTop: "1rem", maxHeight: "300px", overflowY: "auto" }}>
            <h3>Audit Logs</h3>
            <table className="users-table">
              <thead>
                <tr>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Target</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.length > 0 ? (
                  auditLogs.map((log, index) => (
                    <tr key={index}>
                      <td>{log.actor_username}</td>
                      <td>{log.action}</td>
                      <td>{log.target_username}</td>
                      <td>{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">No audit logs found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </>
    )}

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
            placeholder="Enter your password"
          />
          <button onClick={handleBulkDelete}>Confirm Delete</button>
          <button onClick={() => setShowBulkPasswordModal(false)}>Cancel</button>
        </div>
      </div>
    )}

    {/* Edit Admin Modal */}
    {editAdmin && (
      <div className="edit-modal">
        <div className="edit-modal-content">
          <h3>Edit Admin</h3>

          <label>Username:</label>
          <input
            type="text"
            name="username"
            value={editForm.username}
            onChange={handleEditChange}
          />

          <label>Role:</label>
          <input
            type="text"
            name="role"
            value={editForm.role}
            onChange={handleEditChange}
          />

          <label>Account Status:</label>
          <div className="toggle-container">
              <span>{editForm.is_active ? "Active" : "Inactive"}</span>
              <label className="switch">
                  <input type="checkbox" checked={editForm.is_active} onChange={handleToggleActive} />
                  <span className="slider round"></span>
              </label>
          </div>

          <div className="edit-modal-actions">
            <button className="save-button" onClick={handleSaveEdit}>Save</button>
            <button className="cancel-button" onClick={() => setEditAdmin(null)}>Cancel</button>
          </div>
        </div>
      </div>
    )}

     {/* Create Admin Modal */}
     {createAdminModal && (
        <div className="edit-modal">
          <div className="edit-modal-content">
            <h3>Create New Admin</h3>

            <label>Username:</label>
            <input type="text" name="username" value={newAdmin.username} onChange={handleInputChange} />

            <label>Password:</label>
            <input type="password" name="password" value={newAdmin.password} onChange={handleInputChange} />

            <label>Role:</label>
            <select name="role" value={newAdmin.role} onChange={handleInputChange}>
              <option value="super-admin">Super Admin</option>
              <option value="content-manager">Content Manager</option>
              <option value="support-admin">Support Admin</option>
              <option value="read-only">Read Only</option>
            </select>

            <div className="edit-modal-actions">
              <button className="save-button" onClick={handleCreateAdmin}>
                Create
              </button>
              <button className="cancel-button" onClick={() => setCreateAdminModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

  </div>
);
}
export default AdminRoles;