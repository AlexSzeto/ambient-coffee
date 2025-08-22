import express from 'express'
import path from 'path'
import multer from 'multer'
import { fileURLToPath } from 'url'

const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const publicDir = path.join(__dirname, 'public')

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(publicDir, 'media'))
  },
  filename: function (req, file, cb) {
    // Keep original filename, but ensure it's safe
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')
    cb(null, safeName)
  }
})

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Only accept MP3 files
    if (file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/mp3') {
      cb(null, true)
    } else {
      cb(new Error('Only MP3 files are allowed'), false)
    }
  }
})

async function start() {
  try {
    // Enable JSON parsing
    app.use(express.json())
    
    // File upload endpoint
    app.post('/upload-audio', upload.single('audioFile'), (req, res) => {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' })
      }
      
      // Return the relative path to the uploaded file
      const relativePath = `media/${req.file.filename}`
      res.json({ 
        success: true, 
        filePath: relativePath,
        originalName: req.file.originalname
      })
    })
    
    // Static file serving
    app.get('/*', (req, res) => {
      if (req.path === '/') {
        res.sendFile(path.join(publicDir, 'index.html'))
      } else {
        res.sendFile(path.join(publicDir, req.path))
      }
    })

    app.listen(3000, () => {
      console.log('Server is running on http://localhost:3000')
    })
  } catch (err) {
    console.error(err)
  }
}

start()