const bcrypt = require('bcrypt');
const sql = require('../config/db'); // Import the database connection
const jwt = require("jsonwebtoken");
require('dotenv').config();

// Insert user into the database
const register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Check if the login_id already exists
    const existingUser = await sql`
      SELECT * FROM users WHERE login_id = ${username} OR email = ${email}
    `;

    // Check if login_id or email already exists
    if (existingUser.length > 0) {
      const userWithSameUsername = existingUser.find(user => user.login_id === username);
      const userWithSameEmail = existingUser.find(user => user.email === email);

      if (userWithSameUsername && userWithSameEmail) {
        return res.status(400).json({
          error: 'Login ID or email are already taken.',
        });
      } else if (userWithSameUsername) {
        return res.status(400).json({
          error: 'Login ID already exists.',
        });
      } else if (userWithSameEmail) {
        return res.status(400).json({
          error: 'Email already exists.',
        });
      }
    }

    // Hash the password before inserting into the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user data into the 'users' table
    const result = await sql`
      INSERT INTO users (login_id, email, password_hash)
      VALUES (${username}, ${email}, ${hashedPassword})
      RETURNING *`;  // Return the newly created user record

    // Return the inserted user (excluding password_hash)
    const { password_hash, ...newUser } = result[0];
    res.status(201).json({ message: 'User created successfully', user: newUser });

  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


//Login
const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Hash the password before inserting into the database
    const user = await sql`
      SELECT * FROM users WHERE login_id = ${username}
    `;

    if (user.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Compare the provided password with the stored password hash
    const isMatch = await bcrypt.compare(password, user[0].password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Remove the password_hash before sending the user data
    const { password_hash, ...userData } = user[0];

    //user authenticated assigning jsonwebtoken
    const token = jwt.sign(
        { username: userData.login_id },  // Payload: username is included in the JWT
        process.env.JWT_SECRET_KEY,       // Access the secret key from .env file
        { expiresIn: '1h' }              // Token expiration time (1 hour)
      );
   // Respond with the JWT token and user data (without the password hash)
   res.status(200).json({
      message: 'Login successful',
      user: userData,
      token: token  // Send the token to the frontend
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const SeatStatus = async(req,res) =>{
  try{
    const result = await sql`
      SELECT * FROM seat ORDER BY seat_number ASC`;  // Return the newly created user record
    res.json(result)
  }
  catch(error){
    console.error('Error fetching in seat status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}


const BookSeat = async (req, res) => {
  let { number, username } = req.body;
  try {
    if (number > 7) {
      return res.status(401).json({ error: "Users cannot book more than 7 seats at a time" });
    }

    // Fetch all unbooked seats, ordered by coach_number and seat_number
    const seats = await sql`
      SELECT * FROM seat WHERE is_booked = false
    `;

    // Group seats by coach_number and count unbooked seats per coach
    let unbookedSeatsCount = []; // This array will store counts of unbooked seats per coach
    let coaches = {};
    let seatleft = 0;
    
    seats.forEach(seat => {
      if (!coaches[seat.coach_number]) {
        coaches[seat.coach_number] = [];
      }
      coaches[seat.coach_number].push(seat.seat_number);
    });

    // Iterate over the range of coach numbers (1 to 12 as strings) and push counts to unbookedSeatsCount
    for (let coachNumber = 1; coachNumber <= 12; coachNumber++) {
      const coachKey = coachNumber.toString(); // Convert the coachNumber to a string
      if (coaches[coachKey]) {
        unbookedSeatsCount.push(coaches[coachKey].length);
        seatleft += coaches[coachKey].length;
      } else {
        unbookedSeatsCount.push(0);
      }
    }

    if (number > seatleft) {
      return res.status(400).json({ error: "Cannot book seats!! Seats not available" });
    }

    let target = -1;
    for (let coachNumber = 1; coachNumber <= 12; coachNumber++) {
      if (number <= unbookedSeatsCount[coachNumber - 1]) {
        target = coachNumber;
        break;
      }
    }

    // If no specific target coach was selected (i.e., all coaches have available seats)
    if (target === -1) {
      let seatsBooked = 0;
      for (let seatNumber = 1; seatNumber <= 80 && number > 0; seatNumber++) {
        // Update each seat and check if it is booked
        const result = await sql`
          UPDATE seat 
          SET is_booked = true, booked_by = ${username}
          WHERE seat_number = ${seatNumber} AND is_booked = false
        `;
        
        if (result.count > 0) {
          // Only decrement if a seat was booked successfully
          number -= 1;
          seatsBooked += 1;
        }
      }
      return res.status(200).json({ message: "Seats Booked Successfully" });
    } else {
      for (let seatNumber = 1; seatNumber <= 80 && number > 0; seatNumber++) {
        // Update each seat in the specific coach
        const result = await sql`
          UPDATE seat 
          SET is_booked = true, booked_by = ${username}
          WHERE seat_number = ${seatNumber} AND is_booked = false AND coach_number = ${target}
        `;
        if (result.count > 0) {
          // Only decrement if a seat was booked successfully
          number -= 1;
        }
      }
      return res.status(200).json({ message: "Seats Booked Successfully" });
    }
  } catch (error) {
    console.error('Error Booking Seats:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};





const CancelBook = async (req, res) => {
  const { username, seatnumber } = req.body; // Extract username and seatnumber

  try {
    // First, check if the seat exists and its booking status
    const seat = await sql`
      SELECT is_booked, booked_by 
      FROM seat 
      WHERE seat_number = ${seatnumber}
    `;

    // If the seat does not exist or there was an issue with the query
    if (!seat || seat.length === 0) {
      return res.status(401).json({ error: 'Seat not found.' });
    }

    // Case 1: Seat is booked but the username does not match
    if (seat[0].is_booked && seat[0].booked_by !== username) {
      return res.status(402).json({ error: 'Someone else has booked this seat. You cannot cancel it.' });
    }

    // Case 2: Seat is not booked (is_booked = false)
    if (!seat[0].is_booked) {
      return res.status(403).json({ error: 'This seat is not yet booked.' });
    }

    // Case 3: Seat is booked by the username, so proceed with cancellation
    const updateResult = await sql`
      UPDATE seat 
      SET is_booked = false, booked_by = null 
      WHERE seat_number = ${seatnumber} AND booked_by = ${username} AND is_booked = true
    `;

    // If no rows were updated, it means the seat was not booked by the user
    if (updateResult.count === 0) {
      return res.status(400).json({ error: 'Failed to reset booking. Please check if the seat was booked by you.' });
    }

    // Success case, seat booking is successfully canceled
    return res.status(200).json({ message: 'Booking successfully cancelled' });

  } catch (error) {
    console.error('Error canceling booking:', error);
    return res.status(500).json({ error: 'An error occurred while canceling the booking.' });
  }
};


const ResetBook = async (req, res) => {
  const { username } = req.body;  // Extract username from request body
  try {
    // If seats are found, update the booking status to false and username to null
    const updateResult = await sql`
      UPDATE seat 
      SET is_booked = false, booked_by = null 
      WHERE booked_by = ${username} AND is_booked = true`;

    if (updateResult.count === 0) {
      return res.status(400).json({ error: 'Failed to reset booking. No seats updated.' });
    }

    // Success response
    return res.status(200).json({ message: 'Booking reset successfully' });

  } catch (error) {
    console.error('Error resetting booking:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



module.exports= { register,login,SeatStatus,BookSeat,CancelBook,ResetBook};
