const http = require('http');
const express = require('express');
const cors = require('cors');
const app = express();
const bcrypt = require('bcrypt');
const db = require('./database');
const { check, validationResult } = require('express-validator');

app.use(cors());
app.use(express.json());

db.execute('SELECT * FROM users', )
.then(([rows, fields]) => {
  console.log('database connected scussfully' , rows);
  
})
.catch(err =>{
  console.error('database connection failed', err);
});

app.post('/auth/register', [

  check('name')
  .notEmpty()
  .withMessage('Name is required')
  .isLength({ min: 2 })
  .withMessage('Name must be at least 2 characters long'),

  check('email')
  .notEmpty()
  .withMessage('Email is required')
  .isEmail()
  .withMessage('Please provide a valid email'),

  check('mobileNo')
  .notEmpty()
  .withMessage('Mobile number is required')
  .isLength({ min: 10, max: 10 })
  .withMessage('Mobile number must be 10 digits long')

], async(req,res) => {
  console.log(req.body);

  const errors = validationResult(req)
  if(!errors.isEmpty()){
    return res.status(400).json({ errors: errors.array() });
  }
   try {
  const {name, dob,mobileNo, location, email, password,  } = req.body;

  const [existingUser] = await db.execute('SELECT * FROM users WHERE email = ? AND mobileNo = ?', [email, mobileNo])

  if(existingUser.length > 0){
    return res.status(400).json({ message: 'user with this email and mobile number already exists'})
  }
      const hashedPassword = await bcrypt.hash(password, 10);

 await db.execute('INSERT INTO users (name, dob, mobileNo, location, email, password) VALUES (?, ?, ?, ?, ?, ?)',
    [name, dob, mobileNo,location, email, hashedPassword]
  )
  .then(() => {
    // User registration logic here
  })
  .then(() => {
      res.status(200).json({message: 'User registered successfully'});
    });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'An error occurred while registering the user' });
  }
});

app.post('/auth/login', async(req,res) => {
  const { email, password } = req.body;
  try{
    
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ error: 'An error occurred while logging in' });
  }
});

const PORT = 3002;
app.listen(PORT, () =>{
  console.log(`server is running at  http://localhost:${PORT}`);
 
})