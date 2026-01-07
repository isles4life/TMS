const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 4200;

const distPath = path.join(__dirname, 'dist', 'tms-web');

// Serve static files from the Angular app
app.use(express.static(distPath));

// Handle all other routes and return the index.html file
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`TMS frontend server listening at http://localhost:${port}`);
  console.log(`Serving static files from: ${distPath}`);
});
