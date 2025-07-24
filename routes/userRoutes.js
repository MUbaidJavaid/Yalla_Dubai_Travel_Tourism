const express = require("express");
const app = express();
const router = express.Router();

const {
  getlogin,
  getsignup,
  postauth,
  postsignup,
  postget,
  verifyToken,
} = require("../controllers/users");
const { postpersonal, getpersonal } = require("../controllers/personal");

const {
  authJWTandRole,
  emailValidator,
  authenticateJWT,
  loginLimiter,
} = require("../middlewares/middlewares");

router.get("/signup", getsignup);
router.get("/login", getlogin);


router.get("/api/verify-token", verifyToken); 

router.get("/api/booknow", authJWTandRole("user"), getpersonal);
router.post("/auth", authenticateJWT, postauth);
router.post("/signup", emailValidator, postsignup);
router.post("/login", loginLimiter, postget);
router.post("/api/cart", authJWTandRole("user"), postpersonal);

module.exports = router;
