const { Schema, model } = require('mongoose')

const userSchema = new Schema({
  name:{
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  profilePic: {
    type: String,
    default: 'https://res.cloudinary.com/snc0lt/image/upload/v1592585592/jevktw0bab9rzdhaosyu.png'
  },
  followers:[{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
})

module.exports = model('User', userSchema)