// Import required modules
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

// Initialize express app
const app = express();
const PORT = 3000;
const SECRET_KEY = '
7cad34a57442f05e33fbf97483e725ce6021c7f02374fa507c0214e031b08ebe7f2473eabd62642c79460afa4da1990122b9b187dcf1491eef0a2ae698d5e0da';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection (directly using URI in code)
mongoose.connect('mongodb+srv://satyammaurya9620:Rg3yZsQLtq82pgjz@cluster0.mg721.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));


// Define User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Create User model
const User = mongoose.model('User', userSchema);

// Route: Sign Up
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password and save new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
});

// Route: Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
});

// Route: Protected (Example)
app.get('/protected', (req, res) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to authenticate token' });
    }
    res.status(200).json({ message: 'Protected data', userId: decoded.userId });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
