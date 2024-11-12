// Import required modules
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize express app
const app = express();
const PORT = 3000;
const SECRET_KEY = "7cad34a57442f05e33fbf97483e725ce6021c7f02374fa507c0214e031b08ebe7f2473eabd62642c79460afa4da1990122b9b187dcf1491eef0a2ae698d5e0da";

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI("AIzaSyAe_uLEAx15moamS2uAE-EVzF7VHlDVTeg");

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
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

const medicineSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  schedule: { type: String, required: true },
  capsulesLeft: { type: Number, required: true },
  morning: { type: Boolean, default: false },
  evening: { type: Boolean, default: false },
  night: { type: Boolean, default: false }
});

const periodSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true }, // New field for the user's provided date
  nextPeriodDate: { type: Date, required: true },
});

const Period = mongoose.model('Period', periodSchema);

const Medicine = mongoose.model('Medicine', medicineSchema);

// Create User model
const User = mongoose.model('User', userSchema);

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(403).json({ message: 'No token provided' });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Failed to authenticate token' });
    req.userId = decoded.userId; // Attach userId to request
    next();
  });
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Save files in the 'uploads' directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Unique filename
  }
});
const upload = multer({ storage: storage });

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

// Route: Generate AI Doctor Response with optional Image Upload
app.post('/generate-response', upload.single('image'), async (req, res) => {
  const { username, symptoms } = req.body; // Extract username and symptoms from the request body

  // Initialize response message
  let responseMessage = "";

  try {
    // Check if an image was uploaded
    if (req.file) {
      // Read the image file data
      const imageData = fs.readFileSync(req.file.path);
      
      const image = {
        inlineData: {
          data: Buffer.from(imageData).toString("base64"),
          mimeType: req.file.mimetype,
        },
      };

      // Prepare the prompt if an image is uploaded
      const prompt = `
  You are a highly experienced, compassionate female doctor assisting a patient. Respond in a friendly but professional manner, ensuring your responses are concise (around 5-6 lines).

  Based on the uploaded image of the medicine, please:
  - Identify the medicine from the image.
  - Provide information about what the medicine is commonly used for.
  - Describe any key effects or benefits.
  - Include relevant general information without providing medical advice.

  Provide a clear and direct summary:
  - **Medicine Name**: Identify the name of the medicine from the image.
  - **Usage**: Briefly state what the medicine is used for in 1-2 lines.
  - **Dosage Information**: Recommend typical dosage, if available, in 1-2 lines.
  - **General Tips**: Include one or two practical lifestyle or dietary suggestions if relevant.

  Patient's reported symptoms: ${symptoms}.
  Patient's username: ${username}.
`;


      // Generate response using Google Generative AI model
      const model = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent([prompt, image]);

      responseMessage = result.response.text();
    } else {
      // If no image is uploaded, prepare a prompt based only on symptoms
      const prompt = `
        You are a highly experienced, compassionate female doctor assisting a patient. Respond in a friendly but professional manner, ensuring your responses are concise (around 5-6 lines).

        Based on the reported symptoms, please:
        - Provide an overview of possible conditions based on the symptoms described.
        - Include relevant general information without providing medical advice.

        Ask no more than **two specific, short questions** to clarify any details:
           - Can you describe the intensity or duration of the symptoms?
           - Have you experienced these symptoms before, or is this the first time?

        After the questions, provide a clear and direct summary:
           - **Potential Conditions**: Briefly state what might be the cause of the symptoms.
           - **General Recommendations**: Include one or two practical lifestyle or dietary suggestions if relevant.

        Patient's reported symptoms: ${symptoms}.
        Patient's username: ${username}.
      `;

      // Generate response using Google Generative AI model
      const model = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);

      responseMessage = result.response.text();
    }

    // Clean up the uploaded file if it was uploaded
    if (req.file) {
      fs.unlinkSync(req.file.path);
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

app.post('/add-medicine', authenticateToken, async (req, res) => {
  const { name, dosage, schedule, capsulesLeft } = req.body;

  try {
    const newMedicine = new Medicine({
      userId: req.userId, // Associate with authenticated user
      name,
      dosage,
      schedule,
      capsulesLeft,
    });

    await newMedicine.save();
    res.status(201).json({ message: 'Medicine added successfully', medicine: newMedicine });
  } catch (error) {
    res.status(500).json({ message: 'Error adding medicine', error });
  }
});
app.get('/medicines', authenticateToken, async (req, res) => {
  try {
    const medicines = await Medicine.find({ userId: req.userId });
    res.status(200).json(medicines);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching medicines', error });
  }
});

// Assuming you're using Express.js
app.patch('/update-medication-time/:id', async (req, res) => {
  const { time, selected } = req.body; // time will be 'morning', 'evening', 'night', selected will be true or false
  const { id } = req.params;

  // Validate input
  if (!time || !['morning', 'evening', 'night'].includes(time.toLowerCase())) {
    return res.status(400).json({ message: 'Invalid time. Must be "morning", "evening", or "night".' });
  }

  try {
    // Find the medication by ID
    const medication = await Medicine.findById(id);
    if (!medication) {
      return res.status(404).json({ message: 'Medication not found.' });
    }

    // Update the corresponding field (e.g., 'morning', 'evening', or 'night')
    medication[time.toLowerCase()] = selected; // selected will be true or false

    // Save the updated medication
    await medication.save();

    res.status(200).json({ message: 'Medication time updated successfully.', medication });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});


app.post('/set-period', authenticateToken, async (req, res) => {
  const { startDate } = req.body; // Expecting start date input in 'YYYY-MM-DD' format

  try {
    const userId = req.userId;

    // Parse the start date from the request body
    const initialStartDate = new Date(startDate);
    let nextPeriodDate = new Date(initialStartDate);
    nextPeriodDate.setDate(nextPeriodDate.getDate() + 28); // Calculate next period date

    // Check if there's an existing period record for the user
    let periodRecord = await Period.findOne({ userId });

    if (periodRecord) {
      // Update both startDate and nextPeriodDate fields if record exists
      periodRecord.startDate = initialStartDate;
      periodRecord.nextPeriodDate = nextPeriodDate;
    } else {
      // Create a new period record if none exists
      periodRecord = new Period({
        userId,
        startDate: initialStartDate,
        nextPeriodDate,
      });
    }

    // Save the updated or new period record
    await periodRecord.save();

    res.status(200).json({
      message: 'Start and next period dates saved successfully.',
      startDate: periodRecord.startDate,
      nextPeriodDate: periodRecord.nextPeriodDate,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error setting period dates', error });
  }
});


// Route: Get Next Period Date
app.get('/get-next-period', authenticateToken, async (req, res) => {
  try {
    // Fetch the period record for the authenticated user
    const periodRecord = await Period.findOne({ userId: req.userId });
    
    // If no period record is found for the user, return an error
    if (!periodRecord) {
      return res.status(404).json({ message: 'No period record found for this user.' });
    }

    // Return the next period date
    res.status(200).json({
      message: 'Next period date retrieved successfully.',
      nextPeriodDate: periodRecord.nextPeriodDate,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching next period date', error });
  }
});



// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
