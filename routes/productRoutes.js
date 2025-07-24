const express = require("express");
const cors = require("cors");
const app = express();

// convert data into json
app.use(cors());
const router = express.Router();

// routes

const {
  gethome,
  getproduct,
  getCity,
  removefromcart,
} = require("../controllers/productes");
const { authJWTandRole, corsOptions } = require("../middlewares/middlewares");

router.get("/api/home", gethome);

router.get("/api/product", getproduct);



router.get("/api/city", getCity);

router.get("/remove-from-cart", authJWTandRole("user"), removefromcart);

module.exports = router;
