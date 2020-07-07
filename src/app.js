require('dotenv').config()
const express = require('express')
const app = express();
const cors = require('cors')
require('./DB')

// Settings
const PORT = process.env.PORT || 5000

// Middlewares
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cors())

// Routes
app.use('/', require('./routes/auth'))
app.use('/', require('./routes/post'))

app.listen(PORT, ()=> console.log(`server running on port ${PORT}`))