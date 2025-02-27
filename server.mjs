import express from 'express'
import path from 'path'

const app = express()
const __dirname = path.join(path.resolve(), 'public')

async function start() {
  try {
    app.get('/*', (req, res) => {
      if (req.path === '/') {
        res.sendFile(path.join(__dirname, 'index.html'))
      } else {
        res.sendFile(path.join(__dirname, req.path))
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