// Import required modules
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize express app
const app = express();
const PORT = 3000;
const SECRET_KEY = "7cad34a57442f05e33fbf97483e725ce6021c7f02374fa507c0214e031b08ebe7f2473eabd62642c79460afa4da1990122b9b187dcf1491eef0a2ae698d5e0da";

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI("AIzaSyA4jRzg34j878RRC_24ZnXqGV7ZL76Tfao");

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
  email: { type: String, required: true, unique: true }
});

// Create User model
const User = mongoose.model('User', userSchema);

// Route: Sign Up
app.post('/signup', async (req, res) => {
  const { username, password, email } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    const existingEmail = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Username already exists' });
    if (existingEmail) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, email });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
});

// Route: Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token, username: user.username });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
});

// Route: Generate AI Doctor Response
// Initialize an in-memory store to track greeted users
const greetedUsers = {}; // Replace with session or database for persistent tracking

const session = {}; // Simple in-memory session store

app.post('/generate-response', async (req, res) => {
  const { symptoms, username } = req.body;

  // Initialize session for new users using username
  if (!session[username]) {
    session[username] = { hasGreeted: false };
  }

  try {
    // Check if the user's message is a greeting
    const isGreeting = /\b(hello|hi|hey|greetings)\b/i.test(symptoms);

    // Initialize response message
    let responseMessage = "";

    // Greet user only if they send a greeting and have not been greeted before
    if (isGreeting && !session[username].hasGreeted) {
      responseMessage = `Hello, ${username}! How can I assist you today? 😊`;
      session[username].hasGreeted = true; // Update session to indicate greeting has occurred
    }

    // If not a greeting, generate a response based on the symptoms
    if (!isGreeting) {
      // Prepare the prompt without a greeting
      const prompt = `
        You are a highly experienced, compassionate female doctor assisting a patient. Respond as if you're in a friendly but professional conversation, ensuring each response is concise (around 5-6 lines).

        Address the user by their username. For example, say: "Hi ${username}, how can I help you today?" 

        Use emojis to make the conversation more engaging! Include emojis whenever you ask questions or make statements to create a friendly atmosphere.

        Ask no more than **two specific, short questions** to clarify the patient's symptoms and health background. These questions should:
           - Focus on the most relevant details for accurate diagnosis (e.g., duration, intensity, or triggers).
           - Avoid unnecessary repetition and remain respectful.
      
        After asking the questions, provide a clear and direct diagnosis and treatment plan in the following structure:
           - **Diagnosis**: Briefly state the probable condition in 1-2 lines.
           - **Medications**: Recommend specific medications, with dosage and timing, in 1-2 lines.
           - **Lifestyle & Diet**: Include one or two practical lifestyle or dietary suggestions if they can improve the condition.
      
        Patient's reported symptoms: ${symptoms}
      `;

      // Generate response using Google Generative AI model
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      responseMessage += result.response.text(); // Append the AI response
    }

    // Send the final response back to the client
    res.status(200).json({ response: responseMessage });
  } catch (error) {
    res.status(500).json({ message: 'Error generating AI response', error });
  }
});




// Route: Protected (Example)
app.get('/protected', (req, res) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: 'No token provided' });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(500).json({ message: 'Failed to authenticate token' });
    res.status(200).json({ message: 'Protected data', userId: decoded.userId });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
