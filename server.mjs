import express from 'express'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const publicDir = path.join(__dirname, 'public')

async function start() {
  try {
    // Enable JSON parsing with larger limit for file uploads
    app.use(express.json({ limit: '50mb' }))
    app.use(express.urlencoded({ extended: true, limit: '50mb' }))
    
    // File upload endpoint using base64 encoding
    app.post('/upload-audio', async (req, res) => {
      try {
        const { fileName, fileData } = req.body;
        
        if (!fileName || !fileData) {
          return res.status(400).json({ error: 'Missing fileName or fileData' });
        }
        
        // Validate file extension
        if (!fileName.toLowerCase().endsWith('.mp3')) {
          return res.status(400).json({ error: 'Only MP3 files are allowed' });
        }
        
        // Ensure media directory exists
        const mediaDir = path.join(publicDir, 'media');
        if (!fs.existsSync(mediaDir)) {
          fs.mkdirSync(mediaDir, { recursive: true });
        }
        
        // Generate safe filename
        const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = path.join(mediaDir, safeName);
        
        // Convert base64 to buffer and save
        const base64Data = fileData.replace(/^data:audio\/[a-z]+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        fs.writeFileSync(filePath, buffer);
        
        // Return the relative path to the uploaded file
        const relativePath = `media/${safeName}`;
        res.json({ 
          success: true, 
          filePath: relativePath,
          originalName: fileName
        });
        
      } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
    
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