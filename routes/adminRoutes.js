const express = require("express");
const cors = require("cors");
const app = express();
exports.app = app;
// convert data into json
app.use(cors());
const router = express.Router();

// routes
// const { getuserordersdetails, getadmin, postproductcreat, getsingleproduct, deleteproduct, postproductupdate, getadminproductadd, getadminproductupdate
//  }  = require("../controllers/admindashbord.js");
const adminfunctions = require("../controllers/admindashbord.js");
const { authJWTandRole, corsOptions } = require("../middlewares/middlewares");
const multipleUpload = require("../middlewares/upload.js");



// ============= Get Routes Start ================


router.get(
  "/api/admin",
  cors(corsOptions),
  authJWTandRole("admin"),
  adminfunctions.getadmin
);

router.get(
  "/api/userordersdetails",
  cors(corsOptions),
  authJWTandRole("admin"),
  adminfunctions.getuserordersdetails
);

router.get(
  "/api/productdetail",
  cors(corsOptions),
  authJWTandRole("admin"),
  adminfunctions.getadminproductadd
);

router.get(
  "/api/productupdate",
  cors(corsOptions),
  authJWTandRole("admin"),
  adminfunctions.getadminproductupdate
);

router.get(
  "/api/singleproduct",
  cors(corsOptions),
  authJWTandRole("admin"),
  adminfunctions.getsingleproduct
);

// ============= Get Routes end ================

// =============== Post Routes Start ===============


router.post("/api/logout", (req, res) => {
  res.clearCookie("token"); // Remove JWT token
  req.session.destroy(); // Clear the session
  res.redirect("/api/login"); //-
}); //-
//+
router.post(
  "/api/productdetail",
  authJWTandRole("admin"),
  multipleUpload,
  adminfunctions.postproductcreat
); //+
//+
router.post(
  "/api/productupdate",
  authJWTandRole("admin"),
  multipleUpload,
  adminfunctions.postproductupdate
); //+
//+
router.delete(
  "/api/deleteproduct/:id",
  cors(corsOptions),
  adminfunctions.deleteproduct
);

//+
router.delete(
  "/api/deleteOrderProduct/:paymentId/:productId",
  cors(corsOptions),
  adminfunctions.deleteOrderProduct
);

router.patch(
  "/api/updateOrderProduct/:orderId/:productId",
  cors(corsOptions),
  adminfunctions.updateOrderProduct
);

module.exports = router;
