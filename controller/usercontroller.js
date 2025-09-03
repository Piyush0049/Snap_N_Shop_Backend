const User = require("../models/usermodel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendmail = require("../middleware/sendmail");
const { OAuth2Client } = require("google-auth-library");

const SEC_KEY = "This is ecommerce";
const isProduction = process.env.NODE_ENV === "production";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ✅ Common cookie options
const cookieOptions = {
  httpOnly: true,
  secure: true, // Required on Vercel (HTTPS)
  sameSite: isProduction ? "None" : "Lax",
  path: "/",
  domain: isProduction ? ".ecommerce-backend-ochre-two.vercel.app" : undefined, // allow across subdomains
};

// ===================== SIGNUP =====================
exports.createuser = async (req, res) => {
  try {
    let { username, email, password, avatar, work } = req.body;

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      avatar,
      work,
      password: hashedPassword,
    });

    const authtoken = jwt.sign({ _id: newUser._id }, SEC_KEY);

    res.cookie("token", authtoken, {
      ...cookieOptions,
      maxAge: 3600000,
    });

    return res.status(200).json({ success: true, user: newUser, authtoken });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

// ===================== LOGIN =====================
exports.userlogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({ success: false, message: "User does not exist, sign up first" });
    }

    const comp = await bcrypt.compare(password, user.password);
    if (!comp) {
      return res.status(400).json({ success: false, message: "Incorrect password" });
    }

    const authtoken = jwt.sign({ _id: user._id }, SEC_KEY);

    res.cookie("token", authtoken, {
      ...cookieOptions,
      maxAge: 3600000,
    });

    return res.status(200).json({
      success: true,
      message: "Successfully logged in",
      user,
      authtoken,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ===================== GOOGLE LOGIN =====================
exports.googlelogin = async (req, res) => {
  try {
    const token = req.body.token || req.body.googleUser;

    if (!token) {
      return res.status(400).json({ success: false, message: "No token" });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        username: name,
        email,
        password: await bcrypt.hash(sub, 10), // random hash, never used
      });
    }

    const tokenJWT = jwt.sign({ _id: user._id }, SEC_KEY);

    res.cookie("token", tokenJWT, {
      ...cookieOptions,
      maxAge: 3600000,
    });

    res.status(200).json({
      success: true,
      message: "Google login successful",
      token: tokenJWT,
      user,
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ success: false, message: "Google login failed" });
  }
};

// ===================== LOGOUT =====================
exports.userlogout = async (req, res) => {
  try {
    res.clearCookie("token", {
      ...cookieOptions,
      maxAge: 0,
      expires: new Date(0),
    });

    return res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ===================== DELETE USER =====================
exports.userdelete = async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(400).json({ success: false, message: "Login first" });
    }

    const decoded = jwt.verify(token, SEC_KEY);
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(400).json({ success: false, message: "User does not exist" });
    }

    await User.findByIdAndDelete(decoded._id);

    res.clearCookie("token", {
      ...cookieOptions,
      maxAge: 0,
      expires: new Date(0),
    });

    return res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ===================== PROFILE =====================
exports.getuserprofile = async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(200).json({ success: false, message: "Token not found, login first" });
    }

    const decoded = jwt.verify(token, SEC_KEY);
    const user = await User.findById(decoded._id);

    res.status(200).json({ success: true, message: "Here are the user details", user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


exports.forgotpassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: "User does not exists" });
  }
  const resettoken = user.getresetpassword();
  await user.save({ validateBeforeSave: false });
  const resetpassurl = `https://main--golden-custard-15c962.netlify.app/auth/password/reset/${resettoken}`;
  const message = `Your password reset token is : ${resetpassurl} \n\n
    Please ignore if this is a mistake.`;

  try {
    await sendmail({
      email: user.email,
      subject: "Ecommerce Website Password Recovery",
      message,
    });
    res
      .status(200)
      .json({
        success: true,
        message: `Email has been sent to ${user.email} !`,
      });
  } catch (error) {
    user.resetpasswordtoken = undefined;
    user.resetpasswordexpire = undefined;
    await user.save({ validateBeforeSave: false });
    console.log(error);
    return res
      .status(400)
      .json({ success: false, message: "Could not send the mail" });
  }
};

exports.resetpassword = async (req, res, next) => {
  try {
    var { newpassword, confirmpassword } = req.body;
    const resetpasswordtoken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    const user = await User.findOne({
      resetpasswordtoken,
      resetpasswordexpire: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid User" });
    }
    if (newpassword !== confirmpassword) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please fill your new password properly",
        });
    }
    const saltRounds = 10;
    var hashedPassword = await bcrypt.hash(newpassword, saltRounds);
    newpassword = hashedPassword;
    await User.updateOne(
      { _id: user._id }, // Filter: Find user by their ID
      { $set: { password: newpassword } } // Update: Set the new password
    );
    user.resetpasswordtoken = undefined;
    user.resetpasswordexpire = undefined;
    const authtoken = jwt.sign({ _id: user._id }, SEC_KEY);
    const { password } = user;
    res.cookie("token", authtoken, {
      maxAge: 3600000,
      httpOnly: true,
      secure: true,        // must be true on Vercel (HTTPS)
      sameSite: isProduction ? "None" : "Lax",
      path: "/",                     // MUST match
      domain: isProduction ? ".ecommerce-backend-ochre-two.vercel.app" : undefined
      // domain: "https://.ecommerce-backend-ochre-two.vercel.app",
    });
    return res
      .status(200)
      .json({ success: true, message: "Password changed successfully", user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updatepassword = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    const decoded = jwt.verify(token, SEC_KEY);
    const user = await User.findById(decoded._id).select("+password");
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User does not exist" });
    }
    const matched = await bcrypt.compare(req.body.oldpassword, user.password);
    if (!matched) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });
    }
    if (req.body.newpassword !== req.body.confirmpassword) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please fill your new password correctly",
        });
    }
    const saltRounds = 10;
    var hashedPassword = await bcrypt.hash(req.body.newpassword, saltRounds);
    let newpass = hashedPassword;
    await User.updateOne(
      { _id: user._id }, // Filter: Find user by their ID
      { $set: { password: newpass } } // Update: Set the new password
    );
    const authtoken = jwt.sign({ _id: user._id }, SEC_KEY);
    res.cookie("token", authtoken, {
      maxAge: 3600000,
      httpOnly: true,
      secure: true,         // must be true on Vercel (HTTPS)
      sameSite: isProduction ? "None" : "Lax",
      path: "/",                     // MUST match
      domain: isProduction ? ".ecommerce-backend-ochre-two.vercel.app" : undefined
    });
    return res
      .status(200)
      .json({ success: true, message: "Password changed successfully", user });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

exports.updateprofile = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Login with an account first please",
        });
    }
    const decoded = jwt.verify(token, SEC_KEY);

    let user = await User.findById(decoded._id);

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User does not exist" });
    }
    user.email = req.body.email;
    user.username = req.body.username;
    user = await user.save();

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

exports.getallusers = async (req, res, next) => {
  try {
    const users = await User.find();
    if (!users) {
      return res
        .status(400)
        .json({ success: false, message: "No users to display" });
    }
    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.log(error + "omfofaenop");
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

exports.changeTheWorkbByAdmin = async (req, res, next) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User does not exist" });
    }

    user.work = req.body.work;
    await user.save();
    return res
      .status(200)
      .json({
        success: true,
        message: "User's role changed successfully",
        user,
      });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

