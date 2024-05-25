const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const productRoutes = require('./routes/productRoutes'); // Ensure you have productRoutes defined in the mentioned path

const app = express();
app.use(bodyParser.json());

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'solo1',
    password: 's',
    database: 'ecommerce'
};

// User registration route
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );
        connection.end();
        res.status(201).send('User registered');
    } catch (error) {
        res.status(500).send('Registration failed');
    }
});

// User login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        connection.end();
        
        if (rows.length > 0) {
            const user = rows[0];
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                res.status(200).send('Login successful');
            } else {
                res.status(401).send('Invalid credentials');
            }
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (error) {
        res.status(500).send('Login failed');
    }
});

// Password reset route
app.post('/password_reset', async (req, res) => {
    const { email } = req.body;
    // Implement password reset logic (e.g., sending an email with a reset link)
    res.status(200).send('Password reset link sent');
});

// Serve static files from the 'client' directory
app.use(express.static(path.join(__dirname, 'client')));

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

// Serve the register page
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'register.html'));
});

// Serve the login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'login.html'));
});

// Serve the password reset page
app.get('/password_reset', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'password_reset.html'));
});


// Define API routes for products
app.use('/api/products', productRoutes);

// Checkout route
app.post('/api/checkout', (req, res) => {
    const { name, address, email, cart } = req.body;
    // Handle the checkout process (e.g., saving the order to the database, processing payment, etc.)
    console.log('Order received:', { name, address, email, cart });
    res.status(201).json({ message: 'Order placed successfully!' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
