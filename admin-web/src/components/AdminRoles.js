import React, { useState, useEffect } from 'react';

function AdminRoles() {
  const [admins, setAdmins] = useState([]); // ✅ Fix state variable
   const [role, setRole] = useState(null); 
   const [showPasswordModal, setShowPasswordModal] = useState(false);
   const [password, setPassword] = useState('');
   const [deleteAdmin, setDeleteAdmin] = useState(null);
   const [editAdmin, setEditAdmin] = useState(null); 
   const [editForm, setEditForm] = useState({ username: '', password: '', role: '' });

  useEffect(() => {
      fetchAdmins();
    }, []);

  // Auto logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setRole(null);
    alert("Session expired. Please log in again.");
    window.location.href = "/login"; 
  };

  const fetchAdmins = async () =>{
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("You must be logged in.");
        return;
      }

      const response = await fetch('http://localhost:5000/api/adminRoutes'); 
      if (!response.ok) {
        throw new Error('Failed to fetch admins');
      }

      if (response.status === 401) {
        alert("Session expired. Please log in again.");
        logout(); 
        return;
      }
  
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setAdmins(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }

  return (
    <div>
      <h2>Admin List</h2>
      <ul>
        {admins.map(admin => (
          <li key={admin.id}>
            {admin.username} - {admin.role}
          </li>
        ))}
      </ul>
    </div>
  );
}
export default AdminRoles;