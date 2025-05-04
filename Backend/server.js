import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db.js';  // 👈 imported db.js
import User from './models/User.js';

dotenv.config();
const app = express();
const port = 4000; 
 
app.use(cors());
app.use(express.json() );
 
connectDB(); // 👈 calling the reusable MongoDB connection
 
// Register User
app.post('/api/register', async (req, res) => {
  try {
    const exists = await User.findOne({ fingerprintId: req.body.fingerprintId });
    if (exists) return res.status(400).json({ message: '❌ Fingerprint ID already registered' });

    const user = new User(req.body);
    await user.save();
    res.json({ message: '✅ User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login via fingerprint
app.post('/api/login', async (req, res) => {
  const { fingerprintId } = req.body;
  try {
    const user = await User.findOne({ fingerprintId });
    if (!user) return res.status(404).json({ message: '❌ User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.send("Server is working 🚀");
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
