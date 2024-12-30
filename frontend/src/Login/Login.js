import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import logo from "../utils/logo.png";  // Assuming you have a logo file

function Login() {
  // Initialize the navigate function inside the component
  const navigate = useNavigate();

  // State to store login id and password
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form submission
    // Simulate an API call
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: loginId, password: password }),
      });

      const result = await response.json();

      if (response.ok) {
        // Store JWT token in localStorage
        localStorage.setItem('authToken', result.token); // Save token
        localStorage.setItem('username', loginId);       // Save username

        setSuccessMessage(result.message || 'Login Successfully!');
        
        // Redirect to booking page or any other protected page
        navigate('/booking'); // Redirect to booking page
      } else {
        setErrorMessage(result.error || 'Invalid login credentials');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setErrorMessage('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="container1 p-5 shadow-lg rounded bg-white" style={{ maxWidth: '400px' }}>
        {/* Logo */}
        <div className="text-center mb-4">
          <img
            src={logo}
            alt="BookMyTrain Logo"
            className="img-fluid"
            style={{ width: '100px' }}
          />
          <h2 className="mt-3">BookMyTrain</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}> {/* Use onSubmit to handle form submission */}
          <div className="form-outline mb-3">
            <label className="form-label" htmlFor="form2Example1">
              Enter Login ID
            </label>
            <input
              type="text"
              id="form2Example1"
              className="form-control"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)} // Set the value for loginId
              required
            />
          </div>

          <div className="form-outline mb-4">
            <label htmlFor="inputPassword5" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="inputPassword5"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // Set the value for password
              aria-describedby="passwordHelpBlock"
              required
            />
            <div id="passwordHelpBlock" className="form-text">
              Your password must be 8-20 characters long, contain at least one letter, one number, and at least one special character (e.g., !, @, #, $). It must not contain spaces or emoji.
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
          {successMessage && <div className="alert alert-success">{successMessage}</div>}

          <button type="submit" className="btn btn-primary btn-block w-100">
            Login
          </button>

          <div className="text-center mt-3">
            <p>
              Not a member yet?{' '}
              <a href="./register" className="text-decoration-none">
                Register
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
