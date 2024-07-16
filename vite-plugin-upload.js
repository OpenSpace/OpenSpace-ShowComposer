import multer from 'multer';
import { defineConfig } from 'vite';
import { parse } from 'url'; // Import the URL parsing function
import path from 'path';
import fs from 'fs';
// const upload = multer({ dest: 'uploads/' });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Specify the directory where files should be saved
  },
  filename: function (req, file, cb) {
    // Use the original file name and extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const upload = multer({ storage: storage });

export function viteUploadPlugin() {
  return {
    name: 'vite-plugin-upload',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        upload.single('image')(req, res, (err) => {
          if (err) {
            // Step 2: Error handling
            console.error('Error handling file upload:', err);
            return res.status(500).send('Error uploading file');
          }
          const { pathname } = parse(req.url, true); // Parse the URL to get the pathname
          //   console.log(`Received request on ${pathname}`);
          if (pathname === '/upload') {
            // Handle the uploaded file here
            const filePath = req.file.path;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                message: 'File uploaded successfully',
                filePath: filePath,
                // `/${filePath}`,
              }),
            );
          } else if (pathname == '/uploads') {
            console.log('uploads path');
            const uploadsDir = path.resolve(__dirname, 'uploads');
            console.log(uploadsDir);
            fs.readdir(uploadsDir, (err, files) => {
              console.log(files);
              if (err) {
                console.error('Error reading uploads directory:', err);
                return res
                  .status(500)
                  .json({ message: 'Failed to read uploads directory' });
              }

              //   Optional: Filter for image files only (e.g., .jpg, .png)
              const imageFiles = files.filter((file) =>
                /\.(jpg|jpeg|png|gif)$/i.test(file),
              );
              // .map((file) => `uploads/${file}`);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ images: imageFiles }));
            });
            // next();
          } else {
            next(); // Important to call next() if not handling the request here
          }
        });
        //handle uploads path for file info get request
      });
    },
  };
}
