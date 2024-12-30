import React, { useState } from 'react';
import logo from "../utils/logo.png";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Register.css';

function Register() {
  const [loginId, setLoginId] = useState('');
  const [email, setEmailId] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Regex for password validation
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,20}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Check if the password matches the regex
    if (!passwordRegex.test(password)) {
      setPasswordError('Password must be 8-20 characters long, contain at least one letter and one number, and have no spaces or special characters.');
      return; // Prevent form submission if the password is invalid
    }

    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: loginId, email: email, password: password }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessMessage(result.message || 'User registered successfully!');
      } else {
        setErrorMessage(result.error || 'An error occurred. Please try again later.');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setErrorMessage('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg p-4 bg-white rounded" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="text-center">
          <img src={logo} alt="Logo" className="mb-3" style={{ width: '50px', height: '50px' }} />
          <h2 className="mb-4">BookMyTrain</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label" htmlFor="name">Login ID</label>
            <input
              type="text"
              id="name"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="form-control"
              placeholder="Enter your Login Id"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmailId(e.target.value)}
              className="form-control"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(''); // Reset the error when the user types a new password
              }}
              className="form-control"
              placeholder="Enter your password"
              aria-describedby="passwordHelpBlock"
            />
            <div id="passwordHelpBlock" className="form-text">
            Your password must be 8-20 characters long, contain at least one letter, one number, and at least one special character (e.g., !, @, #, $). It must not contain spaces or emoji.
            </div>
            {passwordError && <div className="alert alert-danger mt-2">{passwordError}</div>}
          </div>

          {/* Error Message */}
          {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
          {successMessage && <div className="alert alert-success">{successMessage}</div>}

          <button type="submit" className="btn btn-primary w-100" disabled={!passwordRegex.test(password)}>
            Register
          </button>
          <div className="text-center mt-3">
            <p>Already a member? <a href="/login">Login</a></p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
