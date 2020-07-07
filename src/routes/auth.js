const router = require('express').Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../models/user')
const Post = require('../models/post')
const SECRET = process.env.JWT_SECRET
const auth = require('./verifyToken')


// Signup User
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, profilePic } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please enter all fields' })
    }
    const user = await User.findOne({ email })
    if (user) {
      return res.status(400).json({ error: 'User already exist with that email' })
    }
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      profilePic
    })
    await newUser.save()
    res.status(200).json(newUser)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
}
)

// Login User
router.post('/signin', async (req, res) => {
  try {
    const {email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter all fields' })
    }
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }
    const validPass = await bcrypt.compare(password, user.password)
    if(!validPass) return res.status(400).json({ message: 'Invalid credentials' })
    const {_id, name, followers, following, profilePic } = user
    
    const token = jwt.sign({_id: user._id}, SECRET)
    res.header('auth-token', token)

    res.status(200).json({token, user:{ _id, name, email: user.email, followers, following, profilePic }})
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
}
)

// edit profile
router.put('/edit', auth, async (req, res) => {
  const { profilePic } = req.body
  try {
    await User.findByIdAndUpdate(req.user._id, {$set: {profilePic: profilePic}}, {new: true})
    const user = await User.findById(req.user._id)
    res.status(200).json(user)
  } catch (err) {
    console.log(err)
  }
})

// get one user
router.get('/user/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    const posts = await Post.find({user: req.params.id})
    .populate('user', '_id name')
    .exec()
    res.json({ user, posts })
  } catch (err) {
    console.log(err)
    res.status(404).json({ error: 'user not found'})
  }
})

// follow
router.put('/follow', auth, async(req, res) =>{
  try {
    await User.findByIdAndUpdate(req.body.followId, {
      $push:{followers: req.user._id}
    }, {new: true})
    const user = await User.findByIdAndUpdate(req.user._id, {
      $push:{following: req.body.followId}
    }, {new: true}).select('-password')
    res.status(200).json(user)
  } catch (err) {
    console.log(err)
    res.status(400).json({error: err})
  }
})

// unfollow
router.put('/unfollow', auth, async(req, res) =>{
  try {
    await User.findByIdAndUpdate(req.body.followId, {
      $pull:{followers: req.user._id}
    }, {new: true})
    const user = await User.findByIdAndUpdate(req.user._id, {
      $pull:{following: req.body.followId}
    }, {new: true}).select('-password')
    res.status(200).json(user)
  } catch (err) {
    console.log(err)
    res.status(400).json({error: err})
  }
})

module.exports = router;