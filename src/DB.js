const mongose = require('mongoose');
 
const URI = process.env.MONGO_URI

mongose.connect(URI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})

mongose.connection.on('connected', () => {
  console.log('DB is connected')
})