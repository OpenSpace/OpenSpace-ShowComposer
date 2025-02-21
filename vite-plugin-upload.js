import multer from 'multer';
import { defineConfig } from 'vite';
import { parse } from 'url'; // Import the URL parsing function
import path from 'path';
import fs from 'fs';
import archiver from 'archiver';
import fsp from 'fs/promises';
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
    configureServer: async (server) => {
      server.middlewares.use(async (req, res, next) => {
        if (
          req.method === 'POST' &&
          req.url === '/api/package' &&
          req.headers['content-type'] === 'application/json'
        ) {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk.toString(); // Convert Buffer to string
          });
          req.on('end', async () => {
            req.body = JSON.parse(body); // Parse the JSON string
            try {
              const jsonData = req.body;
              console.log('JSON Data: ', jsonData);
              const projectName =
                jsonData.settingsStore.projectName.replace(/ /g, '_') ||
                'project';
              const zipFileName = `${projectName}-${Date.now()}.zip`;

              // Set up response headers for download
              res.writeHead(200, {
                'Content-Type': 'application/zip', // Set the content type for zip files
                'Content-Disposition': `attachment; filename="${zipFileName}"`, // Set the filename for download
              });

              const archive = archiver('zip', {
                zlib: { level: 9 }, // Maximum compression
              });

              // Pipe archive to the response
              archive.pipe(res);
              jsonData.timestamp = Date.now();
              // Add the JSON file to the zip in a folder named after the project
              archive.append(JSON.stringify(jsonData, null, 2), {
                name: `${projectName}/data.json`,
              });

              // Function to extract image URLs from JSON
              function extractImageUrls(obj) {
                const urls = new Set();
                JSON.stringify(obj, (key, value) => {
                  if (
                    typeof value === 'string' &&
                    (value.startsWith('uploads/') ||
                      value.startsWith('/uploads/'))
                  ) {
                    urls.add(value);
                  }
                  return value;
                });
                return Array.from(urls);
              }

              // Get all image URLs from the JSON
              const imageUrls = extractImageUrls(jsonData);
              const uploadDir = path.join(__dirname, 'uploads');

              // Add each referenced image to the zip
              for (const imageUrl of imageUrls) {
                const fileName = imageUrl.split('/').pop();
                const filePath = path.join(uploadDir, fileName);

                try {
                  // Use fsp for access
                  await fsp.access(filePath);
                  archive.file(filePath, {
                    name: `${projectName}/uploads/${fileName}`,
                  }); // Place images in a subfolder
                } catch (error) {
                  console.warn(
                    `Warning: Referenced image not found: ${fileName}`,
                  );
                }
              }

              // Finalize the zip file
              await archive.finalize();
            } catch (error) {
              console.error('Error creating package:', error);
              // If headers haven't been sent yet, send error response
              if (!res.headersSent) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to create package' }));
              }
            }
            return;
          });
        } else if (req.method === 'POST' && req.url === '/api/projects/save') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk.toString(); // Convert Buffer to string
          });
          req.on('end', async () => {
            try {
              const projectData = JSON.parse(body); // Parse the JSON string
              console.log('projectData', projectData);
              const projectName =
                projectData.settingsStore.projectName.replace(/ /g, '_') ||
                'project';
              const projectsDir = path.join(__dirname, 'projects');
              await fsp.mkdir(projectsDir, { recursive: true });
              // const files = await fsp.readdir(projectsDir);
              const projectFilePath = path.join(
                projectsDir,
                `${projectName}.json`,
              );
              // Save the project data to a file
              await fsp.writeFile(
                projectFilePath,
                JSON.stringify(projectData, null, 2),
              );
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(
                JSON.stringify({
                  message: 'Project saved successfully',
                  filePath: projectFilePath,
                }),
              );
            } catch (error) {
              console.error('Error saving project:', error);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Failed to save project' }));
            }
          });
        } else if (req.method === 'GET' && req.url === '/api/projects') {
          try {
            const projectsDir = path.join(__dirname, 'projects');
            const files = await fsp.readdir(projectsDir);

            const projectList = await Promise.all(
              files.map(async (file) => {
                const filePath = path.join(projectsDir, file);
                const stats = await fsp.stat(filePath); // Get file statistics
                return {
                  filePath: '/' + path.relative(process.cwd(), filePath),
                  projectName: path.basename(file, '.json'),
                  lastModified: stats.mtime, // Last modified date
                  created: stats.birthtime, // Created date
                };
              }),
            );
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(projectList));
          } catch (error) {
            console.error('Error reading projects directory:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({ error: 'Failed to read projects directory' }),
            );
          }
        } else {
          next(); // Call the next middleware for other routes
        }
      });
      server.middlewares.use(async (req, res, next) => {
        upload.single('image')(req, res, async (err) => {
          if (err) {
            // Step 2: Error handling
            console.error('Error handling file upload:', err);
            return res.status(500).send('Error uploading file');
          }
          const { pathname } = parse(req.url, true); // Parse the URL to get the pathname
          //   console.log(`Received request on ${pathname}`);
          if (pathname === '/api/upload') {
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
          } else if (pathname == '/api/images') {
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
              const imageFiles = files
                .filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file))
                .map((file) => `uploads/${file}`);
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
