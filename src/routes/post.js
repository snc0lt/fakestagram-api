const router = require('express').Router()
const Post = require('../models/post')
const User = require('../models/user')
const auth = require('./verifyToken')


// create post route
router.post('/create',auth,  async (req, res)=>{
  const { title, body, photo } = req.body
  if(!title || !body) {
    return res.status(400).json({error: 'Please enter all fields'})
  }

  const user = await User.findById(req.user._id).select("-password")
 
  try {
    const post = new Post({
      title,
      body,
      photo: photo, 
      user: user
    })

    const data = await post.save()
    res.status(200).json(data)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})

// get all post
router.get('/post', async (req, res) => {
  try {
    const posts = await Post.find().populate('user', '_id name').populate('comments.user', '_id name')
    res.status(200).json(posts)
  } catch (err) {
    console.log(err)
    res.status(400).json(err)
  }
})

// get my posts 
router.get('/myposts', auth, async (req, res) => {
  try {
    const posts = await Post.find({user: req.user._id}).populate('user', '_id name')
    res.status(200).json(posts)
  } catch (err) {
    console.log(err)
    res.status(400).json(err)
  }
})

// get post of people i follow
router.get('/followpost',auth ,async (req, res) => {
  try {
    const postedBy = await User.findById(req.user._id)
    const posts = await Post.find({user:{$in: postedBy.following}})
    .populate('user', '_id name').populate('comments.user', '_id name')
    res.status(200).json(posts)
    // console.log(postedBy)
    // res.send(postedBy)
  } catch (err) {
    console.log(err)
    res.status(400).json(err)
  }
})

// like post
router.put('/like', auth, async (req, res) =>{
  
  try {
    await Post.findByIdAndUpdate(req.body.postId,
      {$push:{likes:req.user._id}}, 
      {new:true}).exec((err, result) => {
        if(err){
          return res.status(422).json({ error: err})
        }
        else {
          res.json(result)
        }
    })

  } catch (err) {
    console.log(err)
  }
})

// unlike post
router.put('/unlike', auth, async (req, res) =>{
  
  try {
    await Post.findByIdAndUpdate(req.body.postId,
      {$pull:{likes:req.user._id}}, 
      {new:true}).exec((err, result) => {
        if(err){
          return res.status(422).json({ error: err})
        }
        else {
          res.json(result)
        }
    })

  } catch (err) {
    console.log(err)
  }
})
// delete post 
router.delete('/delete/:id', auth, async (req, res) =>{
  try {
    await Post.findByIdAndDelete(req.params.id)
    res.status(200).json({message: 'post deleted'})
  } catch (err) {
    console.log(err)
  }
})

// comment post
router.put('/comment', auth, async (req, res) =>{
  const user = await User.findById(req.user._id).select('-password')
  const comment = {
    text: req.body.text,
    user: user
  }
  try {
    await Post.findByIdAndUpdate(req.body.postId,
      {$push:{comments:comment}}, 
      {new:true})
      .populate('comments.user', '_id name')
      .populate('user', '_id name')
      .exec((err, result) => {
        if(err){
          return res.status(422).json({ error: err})
        }
        else {
          res.json(result)
        }
    })

  } catch (err) {
    console.log(err)
  }
})
module.exports = router;