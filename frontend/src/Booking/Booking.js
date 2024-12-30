import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { AppBar, Toolbar, Typography, Avatar, TextField, Button, Box, Snackbar, Alert } from "@mui/material";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useNavigate } from "react-router-dom";
import logo from "./logo.png";
import "./Booking.css";

const Booking = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [number,setNumber] = useState("");
  const [seats, setSeats] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [Message, setMessage] = useState('');
  const [severity, setSeverity] = useState('error'); // Default to 'error' for an error message

  // Function to fetch seat data from the backend
  const fetchSeats = async () => {
    try {
      const response = await fetch("http://localhost:5000/Seatstatus"); // Replace with your backend API
      const data = await response.json();
      setSeats(data);
    } catch (error) {
      console.error("Error fetching seats:", error);
    }
  };
  //Function to change value from textfield
  const handleChange = async (event) =>{
    setNumber(event.target.value)
  }

  //Function to book seats
  const handleBook = async() =>{
    try{
      const response = await fetch('http://localhost:5000/bookseat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username,number: number }),
      });
      const result = await response.json();
      switch(response.status){
      case 200:
      setSeverity('success'); // Set the severity to success for successful message
      setMessage(result.message);
      setOpenSnackbar(true);
      break;
      default:
      setSeverity('error');
      setMessage(result.error);
      setOpenSnackbar(true);
      }
      }
      catch(error){
        setSeverity('error');
        setMessage(error);
        setOpenSnackbar(true);
        console.log("Error Cancelling Seats",error)
      }
  }

  // Function to cancel seats calling backend to do this stuff
  const handleCancel = async() =>{
    try{
      const response = await fetch('http://localhost:5000/cancelseat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username,seatnumber: number }),
      });
      const result = await response.json();
      switch(response.status){
      case 200:
      setSeverity('success'); // Set the severity to success for successful message
      setMessage(result.message);
      setOpenSnackbar(true);
      break;
      default:
      setSeverity('error');
      setMessage(result.error);
      setOpenSnackbar(true);
      }
      }
      catch(error){
        setSeverity('error');
        setMessage(error);
        setOpenSnackbar(true);
        console.log("Error Cancelling Seats",error)
      }
  }

  // Function to cancel seats calling backend to do this stuff
  const handleReset = async() => {
    try{
      const response = await fetch('http://localhost:5000/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username }),
      });
      const result = await response.json();
      
      
      if(result.message){
        setSeverity('success'); // Set the severity to success for successful message
        setMessage('Booking reset successfully!');
        setOpenSnackbar(true); // Open the Snackbar to show the success message
      }
      else{
          setMessage(result.error)
          setOpenSnackbar(true)
          setSeverity("error")
      }
    }
    catch(error){
      console.error("Error Cancelling seats:", error);
    }
  }

  // Handle Snackbar close event
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };


  // Function to check token validity
  const checkToken = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        navigate('/login');
      } else {
        setUsername(decoded?.username || "Guest");
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      navigate('/login');
    }
  };

  useEffect(() => {
    // Check token validity and initial data fetch
    checkToken();
    fetchSeats();

    // Set an interval to call fetchSeats every 5 seconds (5000 ms)
    const intervalId = setInterval(() => {
      fetchSeats();
    }, 1000); // Calling Function after 1 sec

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array ensures this effect runs only once when the component mounts

  return (
    <div className="booking-container">
      {/* AppBar */}
      <AppBar position="static" sx={{ backgroundColor: "#ff9900fc" }}>
        <Toolbar>
          <Avatar alt="Logo" src={logo} sx={{ marginRight: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            BookMyTrain
          </Typography>
          <Typography>Welcome, {username}</Typography>
        </Toolbar>
      </AppBar>

      <Container className="mt-4">
        <Row>
          {/* Left Section: Seat Status */}
          <Col md={8} className="seat-status-section">
            <Box
              sx={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "16px",
                backgroundColor: "#f9f9f9",
              }}
            >
              <Typography variant="h5" sx={{ marginBottom: 2 }}>
                Seat Status
              </Typography>
              <div className="seat-grid">
                {seats.map((seat, index) => {
                  const rowIndex = Math.floor(index / 7); // Determine the row index
                  const isLastRow = index >= 77; // Check if it's the last row with 3 seats

                  return (
                    <div
                      key={seat.id}
                      className={`seat ${seat.is_booked ? "booked" : "available"}`}
                      style={{
                        backgroundColor: seat.is_booked ? seat.booked_by==username?"yellow":"green" : "white",
                        border: "1px solid #ccc",
                        width: "40px",
                        height: "40px",
                        textAlign: "center",
                        lineHeight: "40px",
                        borderRadius: "4px",
                        cursor: seat.is_booked ? "not-allowed" : "pointer",
                      }}
                    >
                      {seat.seat_number}
                    </div>
                  );
                })}
              </div>
            </Box>
          </Col>

          {/* Right Section: Input and Buttons */}
          <Col md={4} className="action-section">
            <Box
              sx={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "16px",
                backgroundColor: "#f9f9f9",
              }}
            >
               {/* Snackbar component to show the error message */}
               <Snackbar
              open={openSnackbar}
              autoHideDuration={6000} // Duration for the Snackbar to stay open (in ms)
              onClose={handleCloseSnackbar}
              >
              <Alert severity={severity} onClose={handleCloseSnackbar}>
              {Message}  {/* Error message displayed inside the Alert */}
              </Alert>
              </Snackbar>

              <Typography variant="h5" sx={{ marginBottom: 2 }}>
                Actions
              </Typography>
              <TextField
                label="Enter Number of Seats to Book / Enter Seat Number to Cancel"
                variant="outlined"
                fullWidth
                sx={{ marginBottom: 2 }}
                onChange={handleChange}
                type="number"
              />
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ marginBottom: 2 }}
                onClick={handleBook}
              >
                Book Seat
              </Button>
              <Button variant="contained" color="secondary" fullWidth sx={{ marginBottom: 2 }} onClick={handleCancel}>
                Cancel Booking
              </Button>
              <Button variant="contained" color="primary" fullWidth sx={{backgroundColor:"red"}} onClick={handleReset}>
                Reset Booking
              </Button>
            </Box>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Booking;
