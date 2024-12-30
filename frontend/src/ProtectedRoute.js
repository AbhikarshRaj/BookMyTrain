import React from 'react';
import { Navigate } from 'react-router-dom'; // Import Navigate component

function ProtectedRoute({ element }) {
  const token = localStorage.getItem('authToken');  // Get token from localStorage

  if (!token) {
    // If no token exists, redirect to login page with error message
    alert('User not signed in');
    return <Navigate to="/login" />; // Redirect to login page
  }

  return element; // If token exists, render the protected component
}

export default ProtectedRoute;
