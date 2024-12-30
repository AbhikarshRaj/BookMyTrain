const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors')
const authController = require('./controllers/authController');

dotenv.config(); // Load environment variables from .env file

const app = express();
const port = process.env.PORT || 3000;
app.use(cors())

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Define registration and login routes
app.post('/register', authController.register);
app.post('/login', authController.login);
app.get('/SeatStatus',authController.SeatStatus);
app.post('/bookseat',authController.BookSeat);
app.post('/cancelseat',authController.CancelBook);
app.post('/reset',authController.ResetBook);

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
