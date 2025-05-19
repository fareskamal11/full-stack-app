const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'recordsdb',
});

// Init DB
const initDb = async () => {
  try {
    const client = await pool.connect();
    try {
      // Check if table exists
      const checkTable = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'records'
        );
      `);
      
      if (!checkTable.rows[0].exists) {
        console.log('Creating records table...');
        await client.query(`
          CREATE TABLE records (
            id SERIAL PRIMARY KEY,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        console.log('Records table created successfully!');
      } else {
        console.log('Records table already exists!');
      }
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Database initialization error:', err);
    // Wait and retry connection
    console.log('Retrying database connection in 5 seconds...');
    setTimeout(initDb, 5000);
  }
};

// Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend is healthy!' });
});

app.get('/api/records', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM records ORDER BY created_at DESC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching records:', err);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

app.post('/api/records', async (req, res) => {
  const { content } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }
  
  try {
    const result = await pool.query(
      'INSERT INTO records (content) VALUES ($1) RETURNING *',
      [content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating record:', err);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
  // Initialize database
  initDb();
});
