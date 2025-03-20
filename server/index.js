// Import necessary modules
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Initialize express app
const app = express();
const port = 3000;

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../uploads/'); // Set the upload directory
  },
  filename: function (req, file, cb) {
    // Use the original file name and extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const upload = multer({ storage: storage });

// Serve static files from Vite's build directory
app.use(express.static('../dist')); // Assuming 'dist' is your Vite build directory

// Route for handling file uploads
app.post('/upload', upload.single('image'), (req, res) => {
  // Handle the uploaded file here
  const filePath = req.file.path;
  res.json({
    message: 'File uploaded successfully',
    filePath: filePath.replace('../', ''),
  });
});
app.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.resolve(__dirname, '../uploads', filename);
  res.sendFile(filepath);
});

app.get('/uploads', (req, res) => {
  const uploadsDir = path.resolve(__dirname, '../uploads');

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      console.error('Error reading uploads directory:', err);
      return res
        .status(500)
        .json({ message: 'Failed to read uploads directory' });
    }

    // Optional: Filter for image files only (e.g., .jpg, .png)
    const imageFiles = files.filter((file) =>
      /\.(jpg|jpeg|png|gif)$/i.test(file),
    );

    res.json({ images: imageFiles });
  });
});

// Fallback route for serving your Vite app's entry point for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
