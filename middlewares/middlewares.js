// ============ Builtin Imports ================
const validator = require("validator");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const { execFile } = require("child_process");
const multer = require("multer");
const path = require("path");

require("events").EventEmitter.defaultMaxListeners = 15;

// ============ Process Listener Setup ===========
let listenerAdded = false;
function addListener() {
  if (!listenerAdded) {
    process.once("exit", () => {
      console.log("Process is exiting");
    });
    listenerAdded = true;
  }
}
addListener();

process.once("exit", () => {
  console.log("Final cleanup before exit");
});

console.log("Script is running");

// ============ Safe Shell Commands Handler ===========
const allowedCommands = (req, res) => {
  const commandMap = {
    list: "ls",
    currentDir: "pwd",
  };

  const commandKey = req.query.command;

  if (!commandMap[commandKey]) {
    return res.status(400).send("Invalid command");
  }

  execFile(commandMap[commandKey], (error, stdout, stderr) => {
    if (error) {
      return res.status(500).send(`Error: ${stderr}`);
    } else {
      res.send(`Output: ${stdout}`);
    }
  });
};

// ============ CORS OPTIONS ========================
const corsOptions = {
  origin: "http://localhost:4200", // ✅ Direct and safe for dev
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // ✅ Allow cookies/session
  optionsSuccessStatus: 204,
};

// ============ Email Format Validator ===============
const emailValidator = (req, res, next) => {
  const email = req.body.email;

  if (!validator.isEmail(email)) {
    return res.status(400).send("Invalid email format");
  }

  next();
};

// ============ JWT + Role Auth Middleware ============
const authJWTandRole = (role) => {
  return (req, res, next) => {
    const cookieHeader = req.headers.cookie;

    const token = cookieHeader
      ?.split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return res.redirect("/login");
    }

    try {
      const decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY);

      if (role && role !== decoded.role) {
        return res.status(403).send("Unauthorized access");
      }

      req.user = decoded;
      next();
    } catch (err) {
      return res.status(403).send("Invalid token");
    }
  };
};

// ============ JWT Only Authentication Middleware ========
const authenticateJWT = (req, res, next) => {
  const cookieHeader = req.headers.cookie;

  const token = cookieHeader
    ?.split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  if (!token) {
    return res.status(403).send("Access denied. No token provided.");
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).send("Invalid token");
  }
};

// ============ Login Attempt Limiter ======================
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts, please try again later.",
  status: 410,
});

// ============ Response Header Middleware ==================
const headers = (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:4200");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Disable caching
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");

  next();
};

// ============ Export All Middleware Functions =============
module.exports = {
  emailValidator,
  authJWTandRole,
  authenticateJWT,
  loginLimiter,
  corsOptions,
  headers,
  allowedCommands,
};
