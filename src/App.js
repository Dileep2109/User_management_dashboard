import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserList from './components/UserList';
import UserForm from './components/UserForm';
import './App.css';

const App = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const loadUsers = () => {
    const storedUsers = JSON.parse(localStorage.getItem('users'));
    if (storedUsers) {
      setUsers(storedUsers);
    } else {
      fetchUsers();
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://jsonplaceholder.typicode.com/users');
      const updatedUsers = response.data.map((user, index) => ({
        ...user,
        id: index + 1, 
      }));
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    } catch (error) {
      console.error('Failed to fetch users:', error); 
      // Handle error gracefully (e.g., display an error message to the user)
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = (newUser) => {
    const emailExists = users.some((user) => user.email === newUser.email);
    if (emailExists) {
      setEmailError('Email already exists');
      return;
    }
    setEmailError('');
    const newUserId = users.length > 0 ? Math.max(...users.map((user) => user.id)) + 1 : 1;
    const userWithId = { ...newUser, id: newUserId };
    const updatedUsers = [...users, userWithId];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setEditingUser(null); 
  };

  const handleUpdateUser = (updatedUser) => {
    const emailExists = users.some(
      (user) => user.email === updatedUser.email && user.id !== updatedUser.id
    );
    if (emailExists) {
      setEmailError('Email already exists');
      return;
    }
    setEmailError('');
    const updatedUsers = users.map((user) =>
      user.id === updatedUser.id ? updatedUser : user
    );
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setEditingUser(null); 
  };

  const handleDeleteUser = (id) => {
    const updatedUsers = users
      .filter((user) => user.id !== id)
      .map((user, index) => ({
        ...user,
        id: index + 1, 
      }));
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEmailError('');
  };

  const handleFormClose = () => {
    setEditingUser(null);
    setEmailError('');
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">User Management Dashboard</h1>
      {editingUser ? (
        <UserForm 
          user={editingUser} 
          onSave={editingUser.id ? handleUpdateUser : handleAddUser} 
          onClose={handleFormClose} 
          emailError={emailError} 
        />
      ) : (
        <>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <UserList 
              users={currentUsers} 
              onEdit={handleEditUser} 
              onDelete={handleDeleteUser} 
              onAdd={() => setEditingUser({})} 
              paginate={paginate}
              totalPages={totalPages} 
              currentPage={currentPage} 
            />
          )}
        </>
      )}
    </div>
  );
};

export default App;
