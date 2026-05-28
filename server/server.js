require('dotenv').config();
const cors = require('cors');
const express = require('express');
const connectDB = require('./config/db');
const clientRoutes = require('./routes/clientRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require("./routes/adminRoutes");
require('./services/cronservice');
const logger = require('./utils/logger');


connectDB();



const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/clients', clientRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use("/api/admin",adminRoutes);

const PORT = process.env.PORT || 5001;


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Daily invoice reminder cron job is active');
});


