const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const jobRoutes = require('./routes/jobRoutes.js');
const applicationRoutes = require('./routes/applicationRoutes.js');
const dashboardRoutes = require('./routes/dashboardRoutes.js');
const savedJobRoutes = require('./routes/savedJobRoutes.js');
const profileRoutes = require('./routes/profileRoutes.js');
dotenv.config();

const app = express();
const connectDB = require('./config/database');
app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173'
}));

connectDB();
const PORT = process.env.PORT || 5000;

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/saved-jobs', savedJobRoutes);
app.use('/api/profile', profileRoutes);
app.get('/', (req, res) => {
    res.send("Server is running successfully");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});