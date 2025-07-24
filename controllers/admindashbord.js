const Payment = require("../models/payment");
const collection = require("../models/users");
const Productes = require("../models/productes");
const fs = require("fs").promises;
// ============= admin get function Start ================

async function getadmin(req, res) {
  // Fetch all users data
  const users = await collection.find({ role: { $ne: "admin" } });

  // Fetch all products data
  const products = await Productes.find();

  // Render admin page with fetched personal data
  const order = await Payment.find();

  // res.render("admin");
  res.json({ users, order, products });
}

// ============= admin get function end ================

function getadminproductadd(req, res) {
  res.render("productdetail", { title: "Product Detail" });
}

function getadminproductupdate(req, res) {
  res.render("editproduct", { title: "Product Update" });
}

// controller/paymentController.js

async function getuserordersdetails(req, res) {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({ message: "Missing userId in query." });
    }

    const userDetails = await Payment.find({ userId: userId });

    if (userDetails.length === 0) {
      return res
        .status(404)
        .json({ message: "No orders found for this user." });
    }

    res.status(200).json({ orders: userDetails });
  } catch (error) {
    console.error("❌ Error in getuserordersdetails:", error);
    res.status(500).send("Server Error");
  }
}

module.exports = { getuserordersdetails };

const postproductcreat = async (req, res) => {
  try {
    const {
      cityName,
      citydescription,
      tourService,
      duration,
      privateAdult,
      privateChild,
      transportService,
      private,
      shared,
      pickUp,
      producttitle,
      discountPercentage,
      discountedTotal,
      discountend,
      privatetransferprice,
      quantity,
      productdescription,
      categorie,
      adultBaseprice,
      kidsBaseprice,
      translatelanguage,
      wifi,
    } = req.body;

    const cityImage = req.files["cityImage"]
      ? req.files["cityImage"][0].filename
      : null;
    const thumbnail = req.files["thumbnail"]
      ? req.files["thumbnail"].map((file) => file.filename)
      : [];

    if (
      !cityName ||
      !citydescription ||
      !cityImage ||
      !tourService ||
      !duration ||
      !transportService ||
      !pickUp ||
      !producttitle ||
      !discountPercentage ||
      !discountedTotal ||
      !thumbnail ||
      !discountend ||
      !quantity ||
      !productdescription ||
      !categorie ||
      !adultBaseprice ||
      !kidsBaseprice ||
      !translatelanguage ||
      !wifi
    ) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const product = await Productes.create({
      cityName,
      citydescription,
      cityImage,
      tourService,
      duration,
      transportService,
      pickUp,
      private,
      shared,
      producttitle,
      discountPercentage,
      discountedTotal,
      thumbnail,
      discountend,
      privateAdult,
      privateChild,
      privatetransferprice,
      quantity,
      productdescription,
      categorie,
      adultBaseprice,
      kidsBaseprice,
      translatelanguage,
      wifi,
    });

    // ✅ Always return success response as JSON
    return res
      .status(200)
      .json({ msg: "Product created successfully", product });
  } catch (error) {
    console.error("❌ Backend Error:", error);
    return res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

async function getsingleproduct(req, res) {
  try {
    const productID = req.query.id;

    const product = await Productes.findById(productID);
    if (!product)
      return res
        .status(404)
        .send("The product with the given ID was not found.");
    return res.json({ product });
  } catch (error) {
    res.status(500).send(error.message);
  }
}

function deleteproduct(req, res) {
  const productId = req.params.id; 
  Productes.findByIdAndDelete(productId)
    .then((deletedProduct) => {
      if (!deletedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(200).json({ message: "Product deleted successfully" });
    })
    .catch((error) => {
      console.error("Server error:", error);
      res.status(500).json({ message: "Server error" });
    });
}

async function postproductupdate(req, res) {
  try {
    const productId = req.query._id;
    if (!productId) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const isPrivate = req.body.private === "true" || req.body.private === true;

    const updateData = {
      cityName: req.body.cityName,
      citydescription: req.body.citydescription,
      tourService: req.body.tourService,
      duration: req.body.duration,
      transportService: req.body.transportService,
      pickUp: req.body.pickUp,
      producttitle: req.body.producttitle,
      discountPercentage: req.body.discountPercentage,
      discountedTotal: req.body.discountedTotal || req.body.discountedtotal,
      quantity: req.body.quantity,
      productdescription: req.body.productdescription,
      categorie: req.body.categorie,
      adultBaseprice: req.body.adultBaseprice,
      kidsBaseprice: req.body.kidsBaseprice,
      translatelanguage: req.body.translatelanguage,
      wifi: req.body.wifi,
      privatetransferperson: req.body.privatetransferperson,
      private: isPrivate,
    };

    // Improved private fields handling
    if (isPrivate) {
      updateData.privateAdult = req.body.privateAdult
        ? parseFloat(req.body.privateAdult)
        : req.body.privateAdult === ""
        ? null
        : updateData.privateAdult;

      updateData.privateChild = req.body.privateChild
        ? parseFloat(req.body.privateChild)
        : req.body.privateChild === ""
        ? null
        : updateData.privateChild;

      updateData.privatetransferprice = req.body.privatetransferprice
        ? parseFloat(req.body.privatetransferprice)
        : req.body.privatetransferprice === ""
        ? null
        : updateData.privatetransferprice;
    } else {
      updateData.privateAdult = null;
      updateData.privateChild = null;
      updateData.privatetransferprice = null;
    }

    console.log("Private fields update:", {
      isPrivate,
      privateAdult: updateData.privateAdult,
      privateChild: updateData.privateChild,
      privatetransferprice: updateData.privatetransferprice,
    });

    // Handle file uploads
    if (req.files) {
      // City image handling
      if (req.files.cityImage?.length > 0) {
        updateData.cityImage = req.files.cityImage[0].filename;
        if (req.body.existingCityImage) {
          await fs
            .unlink(`./uploads/${req.body.existingCityImage}`)
            .catch(() => {});
        }
      } else {
        updateData.cityImage = req.body.cityImage || req.body.existingCityImage;
      }

      // Thumbnails handling
      const existingThumbs = req.body.existingThumbnails
        ? Array.isArray(req.body.existingThumbnails)
          ? req.body.existingThumbnails
          : [req.body.existingThumbnails]
        : [];

      if (req.files.thumbnail?.length > 0) {
        updateData.thumbnail = [
          ...existingThumbs,
          ...req.files.thumbnail.map((f) => f.filename),
        ];
      } else {
        updateData.thumbnail = existingThumbs;
      }
    } else {
      updateData.cityImage = req.body.cityImage || req.body.existingCityImage;
      updateData.thumbnail = req.body.existingThumbnails
        ? Array.isArray(req.body.existingThumbnails)
          ? req.body.existingThumbnails
          : [req.body.existingThumbnails]
        : [];
    }

    const updated = await Productes.findByIdAndUpdate(
      productId,
      { $set: updateData }, // Use $set operator to ensure partial updates
      { new: true, runValidators: true } // Run schema validators
    );

    if (!updated) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "✅ Product updated successfully",
      product: updated,
    });
  } catch (error) {
    console.error("❌ Update error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}

module.exports = { postproductupdate };

async function deleteOrderProduct(req, res) {
  const paymentId = req.params.paymentId; // Order ID
  const productIdToDelete = req.params.productId; // Product ID

  try {
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ message: "Payment (Order) not found" });
    }

    if (!payment.products || payment.products.length === 0) {
      const deleted = await Payment.findByIdAndDelete(paymentId);
      if (!deleted) {
        return res
          .status(404)
          .json({ message: "Order not found or already deleted" });
      }
      return res
        .status(200)
        .json({ message: "Order had no products, so it was deleted" });
    }

    const productIndex = payment.products.findIndex(
      (product) => product._id.toString() === productIdToDelete
    );

    // ✅ If product not found, delete order
    if (productIndex === -1) {
      await Payment.findByIdAndDelete(paymentId);
      return res
        .status(200)
        .json({ message: "Product not found, so order deleted" });
    }

    const productTotal = payment.products[productIndex].total || 0;
    payment.products.splice(productIndex, 1);
    if (payment.total) {
      payment.total -= productTotal;
    }

    // ✅ If no products left after deletion, delete the order
    if (payment.products.length === 0) {
      await Payment.findByIdAndDelete(paymentId);
      return res
        .status(200)
        .json({ message: "Last product removed, so order deleted" });
    }

    // ✅ Otherwise save the updated order
    await payment.save();

    return res.status(200).json({
      message: "Product deleted and total updated successfully",
      payment,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

async function updateOrderProduct(req, res) {
  const paymentId = req.params.orderId;
  const productIdToUpdate = req.params.productId;
  const updatedProductData = req.body;
  try {
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ message: "Payment (Order) not found" });
    }

    const productIndex = payment.products.findIndex(
      (product) => product._id.toString() === productIdToUpdate
    );

    if (productIndex === -1) {
      console.log(
        "❌ Product not found in order. Product ID:",
        productIdToUpdate
      );
      return res.status(404).json({ message: "Product not found in order" });
    }

    // 🔁 Reference to product
    const product = payment.products[productIndex];

    const oldProductTotal = product.total ?? 0;

    for (let key in updatedProductData) {
      // console.log(
      //   `✏️ Updating ${key}: ${product[key]} → ${updatedProductData[key]}`
      // );
      product[key] = updatedProductData[key];
    }

    // 🧮 Update payment total
    const newProductTotal = product.total ?? 0;
    payment.total = (payment.total ?? 0) - oldProductTotal + newProductTotal;
    // 💾 Save changes
    await payment.save();

    res.status(200).json({
      message: "Product updated and total recalculated",
      payment,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  getuserordersdetails,
  getadmin,
  postproductcreat,
  getsingleproduct,
  deleteproduct,
  postproductupdate,
  getadminproductadd,
  getadminproductupdate,
  deleteOrderProduct,
  updateOrderProduct,
};
