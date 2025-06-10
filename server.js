
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// CORS headers middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Handle preflight OPTIONS request for /send-message
app.options('/send-message', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(200);
});

// POST endpoint to save messages
app.post('/send-message', (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).send('No message sent');
  }

  const entry = `${new Date().toISOString()} - ${message}\n`;
  const filePath = path.join(__dirname, 'messages.txt');

  fs.appendFile(filePath, entry, (err) => {
    if (err) {
      console.error('Failed to save message:', err);
      return res.status(500).send('Failed to save message');
    }
    console.log('Message saved:', entry.trim());
    res.send('Message received and saved.');
  });
});

// GET endpoint to read messages
app.get('/messages', (req, res) => {
  const filePath = path.join(__dirname, 'messages.txt');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        return res.send('No messages yet.');
      }
      return res.status(500).send('Failed to read messages');
    }
    res.type('text/plain').send(data);
  });
});

// Serve index.html on root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
