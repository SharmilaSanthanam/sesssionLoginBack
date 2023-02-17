const UserSchema = require('./userModel')
const bcrypt = require('bcrypt')
const express = require('express')
const router = express.Router()
const auth = require('./auth')

router.post('/register', async (req, res) => {
  const { name, email, password, cpassword } = req.body

  if (!email || !password)
    return res.status(400).json({ msg: 'Password and email are required' })

  if (password.length < 8) {
    return res
      .status(400)
      .json({ msg: 'Password should be at least 8 characters long' })
  }

  const user = await UserSchema.findOne({ email })
  if (user) return res.status(400).json({ msg: 'User already exists' })

  const newUser = new UserSchema({ email, password })
  bcrypt.hash(password, 7, async (err, hash) => {
    if (err)
      return res.status(400).json({ msg: 'error while saving the password' })

    newUser.password = hash
    const savedUserRes = await newUser.save()

    if (savedUserRes)
      return res.status(200).json({ msg: 'user is successfully saved' })
  })
})

router.post(`/login`, async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({ msg: 'Something missing' })
  }

  const user = await UserSchema.findOne({ email: email }) // finding user in db
  if (!user) {
    return res.status(400).json({ msg: 'User not found' })
  }

  const matchPassword = await bcrypt.compare(password, user.password)
  if (matchPassword) {
    const userSession = { id: user._id, email: user.email } // creating user session to keep user loggedin also on refresh
    req.session.user = userSession // attach user session to session object from express-session

    return res
      .status(200)
      .json({status: "Ok", msg: 'You have logged in successfully', user, userSession }) // attach user session id to the response. It will be transfer in the cookies
  } else {
    return res.status(400).json({ msg: 'Invalid credential' })
  }
})

// router.post("/userData", async (req, res) => {
//     const { token } = req.body;
//     try {
//       const user = jwt.verify(token, JWT_SECRET, (err, res) => {
//         if (err) {
//           return "token expired";
//         }
//         return res;
//       });
//       // console.log(user);
//       if (user == "token expired") {
//         return res.send({ status: "error", data: "token expired" });
//       }
  
//       const useremail = user.email;
//       UserSchema.findOne({ email: useremail })
//         .then((data) => {
//                    res.send({ status: "ok", data: data });
         
//         })
//         .catch((error) => {
//           res.send({ status: "error", data: error });
//         });
//     } catch (error) {}
//   });

router.get(`/logout`, async (req, res) => {
  const {userSession} = req.body;
  try{
    if (req.session) {
      // delete session object
      req.session.destroy(function(err) {
          if(err) {
              return next(err);
          } else {
              req.session = null;
              console.log("logout successful");
              return res.redirect('/');
          }
      });
  }  
  // req.session.destroy();
  // // res.redirect('/');
  // // req.session.destroy((error) => {
  // //   if (error) throw error

  // //   res.clearCookie('session-id') // cleaning the cookies from the user session
  //   res.status(200).send('Logout Success')
  } catch(error){
    console.log(error.message);
  }
})

router.get(`/isAuth`,  async (req, res) => {
  if (req.session.user) {
    return res.json(req.session.user)
  } else {
    return res.status(401).json('unauthorize')
  }
})

//get a user
router.get("/:id", async (req, res) => {
    const {id} = req.params;
    try {
      const user = await UserSchema.findById(id);
       
      res.send({ status: "ok", data: user });
     
    } catch (err) {
      res.status(500).json(err);
    }
  });

  //update a user
  router.put("/:id", async (req, res) => {
    const {id} = req.params;
   
    try {
      const {name, email} = req.body;
      const user = await UserSchema.findByIdAndUpdate(id, {name, email});
  await user.save();
     
      res.send({ status: "Ok", data: user });
    } catch (error) {
      console.log(error);
    }
  });

module.exports = router
