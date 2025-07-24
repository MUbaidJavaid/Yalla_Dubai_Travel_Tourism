// ============ Builtin imports Start ================

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const session = require("express-session");

// ============ Builtin imports end ================

// ============ User define imports Start ================

const collection = require("../models/users");

// ============ User define imports end  ================

// ============ Using a predefined secret key for JWT token =============

const secretKey = process.env.TOKEN_SECRET_KEY; // This should be stored in a secure environment

// ============= auth user post function ================

function postauth(req, res) {
  const user = req.user;
  res.status(200).json({ user });
}

// =============== login get function Start ================

function getlogin(req, res) {
  res.render("login");
}

// =============== login get function end ================

// ============== signup get function Start ================

function getsignup(req, res) {
  res.render("signup");
}

// ============== signup get function end ================

// ============= post signup function Start ================

async function postsignup(req, res) {
  try {
    const data = {
      name: req.body.username,
      email: req.body.email,
      password: req.body.password,
      role: "user",
    };

    const existuser = await collection.findOne({ email: data.email });

    if (existuser != null) {
      return res.status(409).json({ message: "Email already exists" }); // ✅ Proper response
    } else {
      const hashpasword = await bcrypt.hash(data.password, 10);
      data.password = hashpasword;
      await collection.insertMany(data);

      return res.status(200).json({ message: "Signup successful" }); // ✅ Respond with JSON
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while signing up the user",
      error: error.message,
    });
  }
}

// ============== post signup function end ================

// ============== post login function Start ================

// is ka

// Login handler
async function postget(req, res) {
  try {
    const user = await collection.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const passwordMatch = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!passwordMatch)
      return res.status(401).json({ message: "Wrong password" });

    // Create JWT token
    const token = jwt.sign({ email: user.email, role: user.role }, secretKey, {
      expiresIn: "1h",
    });

    //     // Optional: Store session data
    // req.session.userId = user.id;
    //     req.session.userName = user.name;
    //     req.session.userEmail = user.email;
    //     req.session.cart = [];

    let sessionAlreadyExists = req.session.userId !== undefined;
    if (!sessionAlreadyExists) {
      req.session.userId = user.id;
      req.session.userName = user.name;
      req.session.userEmail = user.email;
      req.session.cart = [];
    }

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict", 
      maxAge: 3600000, 
    });

    return res.status(200).json({
      message: "Login successful",
      role: user.role,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "An error occurred during login" });
  }
}
function verifyToken(req, res) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Token not found" });
  }

  try {
    const decoded = jwt.verify(token, secretKey);

    // decoded ke andar role hona chahiye
    if (!decoded.role) {
      return res.status(403).json({ message: "Role not defined in token" });
    }

    return res.status(200).json({
      message: "Token valid",
      role: decoded.role, // 👈 Frontend authGuard ko yeh chahiye
      user: decoded,
    });
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}



// ============== post login function end ================

// ============== Module Exports ================
module.exports = {
  postauth,
  getlogin,
  getsignup,
  postsignup,
  postget,
  verifyToken, // ✅ Add this line
};
