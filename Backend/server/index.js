// index.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your_secret_key';

app.use(cors());
app.use(bodyParser.json());

// Dummy user for demonstration
const users = [
  {
    id: 1,
    username: 'admin',
    password: bcrypt.hashSync('password', 10) // hashed password
  }
];

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Find user
  const user = users.find(user => user.username === username);
  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  // Verify password
  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  // Generate token
  const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
  res.status(200).json({ message: 'Login successful', token });
});

// Protected route example
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
