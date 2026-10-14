const dotenv = require('dotenv');
dotenv.config(); // Must be first — loads .env before any module reads process.env

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const jobRoutes = require('./routes/jobRoutes.js');
const applicationRoutes = require('./routes/applicationRoutes.js');
const dashboardRoutes = require('./routes/dashboardRoutes.js');
const savedJobRoutes = require('./routes/savedJobRoutes.js');
const profileRoutes = require('./routes/profileRoutes.js');

const app = express();

app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173'
}));

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

// Start server only after the database connection is established.
// await ensures MongoDB is ready before Express accepts any requests.
const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

startServer();