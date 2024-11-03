import React, { useState, useEffect } from 'react';

function Users() {
  const [users, setUsers] = useState([]);

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
      console.log("Fetched data:", data); 
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Function to handle deleting a user
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/students/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setUsers(users.filter((user) => user.std_id !== id)); // Update state to remove the deleted user
          alert('Student deleted successfully');
        } else {
          alert('Failed to delete student');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  return (
    <div>
      <h2>Users</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Middle Name</th>
            <th>Last Name</th>
            <th>Email </th>
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
              <td>
                <button>Edit</button>
                <button onClick={() => handleDelete(user.std_id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Users;