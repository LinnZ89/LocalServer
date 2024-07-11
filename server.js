const express = require('express');
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = 5000;

// Enable CORS
app.use(cors());

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Ensure the uploads directory exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Add a simple route for the root URL
app.get('/', (req, res) => {
    res.send('Image Comparison Server is running');
});

// Endpoint to handle image uploads
app.post('/upload', upload.single('file'), (req, res) => {
    const filePath = req.file.path;
    const fileUrl = `${req.protocol}://${req.get('host')}/${filePath}`;

    res.json({ imageUrl: fileUrl });
});

// Endpoint to handle image comparison
app.post('/compare', upload.single('file'), (req, res) => {
    const serverImageUrl = req.body.serverImageUrl;
    const localImagePath = req.file.path;

    const localImageDirectory = "C:\\Users\\nhl08\\OneDrive\\Máy tính\\imagesipfs\\image-comparison-server\\image";
    const pythonProcess = spawn('python3', ['compare_images.py', localImagePath, serverImageUrl, localImageDirectory]);

    pythonProcess.stdout.on('data', (data) => {
        const similarity = parseFloat(data.toString());
        res.json({ similarity });
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        res.status(500).send(data.toString());
    });

    pythonProcess.on('close', (code) => {
        // Clean up the uploaded file
        fs.unlinkSync(localImagePath);
        console.log(`child process exited with code ${code}`);
    });
});


// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(port, () => {
    console.log(`Server running on http://116.109.144.226:${port}`);
});
