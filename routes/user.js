const express = require('express');
const User = require('../models/User.model');
const UserType = require('../models/UserType.model');
const router = express.Router();
const { check, validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = 'auditbhai'
let success = false

// Route 1: Create a User type using: POST "/api/auth/user-type". require Auth
router.post('/user-type', fetchuser, async (req, res) => {
  if (req.headers['content-type'] !== 'application/json') {
    return res.status(415).send({ error: 'Invalid content type' });
  }

  const { name } = req.body;
  try {
    const userType = await UserType.create({user_type: name})
    if(userType){
      success = true
      res.status(201).json({success, userType})
      success = false
    } else {
      res.status(400).json({success, "error": "Failed"})
    }
  } catch {
    res.status(500).json({ success, error: 'Internal Server Error' });
  }
  
});

// Route 2: Create a User using: POST "/api/auth/createuser". Doesn't require Auth
router.post('/createuser',[
  check("name").isLength({ min: 3, max: 50 }).withMessage("Name must be between 3 and 50 characters"),
  check("email").isEmail().withMessage("Invalid email address"),
  check("password").isLength({ min: 5, max: 18 }).withMessage("Password must be between 5 and 18 characters"),
  check("phone").isLength({ min: 12, max: 12 }).withMessage("Phone must be 12 digit number"),
  check("userType").exists().withMessage("User type can not be blank"),
], async (req, res) => {
  
  if (req.headers['content-type'] !== 'application/json') {
    return res.status(415).send({ error: 'Invalid content type' });
  }

  // check errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({success, errors: errors.array() });
  }

  const {name, email, password, phone, userType} = req.body
  
  try {
    // Check if user is already exists
    let user = await User.findOne({ email: email });
    if (user) {
      return res
        .status(400)
        .json({success, error: "Sorry a user with this email already exist" });
    }

    // check user type is valid
    let utype = await UserType.findOne({ user_type: userType });
    if (!utype) {
      return res.status(400).json({success, error: "User type did not found"})
    }
    
    // Generate Secure Password
    const salt = await bcrypt.genSaltSync(10);
    const secPass = await bcrypt.hashSync(password, salt);


    // Create User
    user = await User.create({
      name: name,
      email: email,
      password: secPass,
      phone: phone.toString(),
      user_type: utype.id
    })

    if(user){
      const data = {
        user: {
          id: user.id
        }
      }
      // Generate authtoken
      const authtoken = jwt.sign(data, JWT_SECRET)
      success = true
      res.status(201).json({success, authtoken});
      success = false
    } else {
      res.status(400).json({ success, error: 'Failed to create user' });
    }

  } catch(error) {
    res.status(500).json({ success, error: 'Internal Server Error' });
  }
});

// Route 3: Login a User using: POST "/api/auth/login". Doesn't require Auth
router.post('/login', [
  check("email").isEmail().withMessage("Enter a valid email"),
  check("password").exists().withMessage("Password can not be blank"),
], async (req, res)=>{

    if (req.headers['content-type'] !== 'application/json') {
      return res.status(415).send({ error: 'Invalid content type' });
    }

    // check errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({success, errors: errors.array() });
    }
  
    const {email, password} = req.body

    try {
      let user = await User.findOne({email});
      if(!user){
        return res.status(400).json({success, errors: "Please try to login with correct credentials"})
      }

      const passwordCompare = await bcrypt.compare(password, user.password)
      if(!passwordCompare){
        return res.status(400).json({success, errors: "Please try to login with correct credentials"})
      }

      const data = {
        user: {
          id: user.id
        }
      }
      // Generate authtoken
      const authtoken = jwt.sign(data, JWT_SECRET)
      success = true
      res.status(200).json({success, authtoken});
      success = false
    } catch(error){
      res.status(500).json({ success, error: 'Internal Server Error' });
    }
})

module.exports = router;