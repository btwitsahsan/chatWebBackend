const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// Register user
const registerUser = expressAsyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // validation
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("please fill all fields");
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error("password must be up to 6 characters");
  }

  //check user if exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("Email has already been registered");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  // Generate Token
  const token = generateToken(user._id);
  if (user) {
    const { _id, name, email, role } = user;
    // res.cookie("token", token, {
    //   path: "/",
    //   httpOnly: true,
    //   secure: true,
    //   sameSite : none,
    //   expires: new Date(Date.now() + 1000 * 86400),
    // });
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      secure: true, // ✅ Needed for HTTPS
      sameSite: "None", // ✅ Ensures cross-site cookie storage
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
    });

    res.status(201).json({
      _id,
      name,
      email,
      role,
      token,
    });
  } else {
    res.status(400);
    throw new Error("invalid user data");
  }
});

const loginUser = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // validation
  if (!email || !password) {
    res.status(400);
    throw new Error("please add email or password");
  }

  //check user if exists
  const user = await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error("User does not exist...");
  }
  // check if the password is correct
  const passwordCorrect = await bcrypt.compare(password, user.password);

  // Generate token
  const token = generateToken(user._id);


  if (user && passwordCorrect) {
    const newUser = await User.findOne({ email }).select("-password");
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      secure: true, // ✅ Needed for HTTPS
      sameSite: "None", // ✅ Ensures cross-site cookie storage
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
    });
    res.status(201).json(newUser);
  } else {
    res.status(400);
    throw new Error("invalid email or password");
  }
});

const logout = expressAsyncHandler(async (req, res) => {
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite : "None",
    expires: new Date(0),
  });
  res.status(200).json({ message: "User Successfully Logged-out..." });
});

const getUser = expressAsyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(400);
    throw new Error("User Not Found");
  }
});


const getAllUser = expressAsyncHandler(async (req, res) => {
  const users = await User.find().select("-password");
  if (users) {
    res.status(200).json(users);
  } else {
    res.status(400);
    throw new Error("User Not Found");
  }
});

const checkLoginStatus = expressAsyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json(false);
  }
  // Verify Token
  const verified = await jwt.verify(token, process.env.JWT_SECRET);

  if (verified) {
    return res.json(true);
  } else {
    return res.json(false);
  }
});

const updateUser = expressAsyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const { name, phone, address } = user;
    user.name = req.body.name || name;
    user.phone = req.body.phone || phone;
    user.address = req.body.address || address;

    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } else {
    res.status(400);
    throw new Error("User Not Found");
  }
});

const updatePhoto = expressAsyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.photo = req.body.photo;
  const updatedUser = await user.save();
  res.status(200).json(updatedUser);
});





const getUserById = expressAsyncHandler(async (req, res) => {
  const user = await User.findById(req.query.userId).select("-password");
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(400);
    throw new Error("User Not Found");
  }
});
module.exports = {
  registerUser,
  loginUser,
  logout,
  getUser,
  updateUser,
  updatePhoto,
  checkLoginStatus,
  getUserById,
  getAllUser,
};
