const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.options('/send-message', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.sendStatus(200);
});

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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
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

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});