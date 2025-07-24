const Payment = require("../models/payment");
const Productes = require("../models/productes");

// ============ User define imports end  ================

// ============ post personal function Start ================
async function postpersonal(req, res) {
  try {
    const {
      first_name,
      last_name,
      address,
      payment_Method,
      city,
      state,
      country,
      name_On_Card,
      card_Number,
      zip,
      expiry,
      cvv,
      date,
      products,
    } = req.body;

    // Check if session data is available
    if (
      !req.session.userId ||
      !req.session.userName ||
      !req.session.userEmail
    ) {
      return res
        .status(401)
        .json({ message: "Unauthorized. User session missing." });
    }

    const newPayment = {
      userId: req.session.userId,
      userName: req.session.userName,
      userEmail: req.session.userEmail,
      first_name,
      last_name,
      address,
      payment_Method,
      city,
      state,
      country,
      name_On_Card,
      card_Number,
      zip,
      expiry,
      cvv,
      date,
      products, // ✅ contains full product detail from frontend
    };

    const saved = await Payment.create(newPayment);
    req.session.cart = [];
    res.status(201).json({ message: "Payment saved successfully", saved });
  } catch (error) {
    console.error("Error in postpersonal:", error);
    res
      .status(500)
      .json({ message: "Failed to save payment", error: error.message });
  }
}

module.exports = { postpersonal };

// ============ get personal function Start ================

async function getpersonal(req, res) {
  const productId = req.query.id;
  const transfertype = req.query.transfertype;
  const adults_no = parseInt(req.query.adults_no) || 0;
  const kids_no = parseInt(req.query.kids_no) || 0;
  const privateAdult = parseInt(req.query.privateAdult) || 0;
  const privateChild = parseInt(req.query.privateChild) || 0;
  const total = parseFloat(req.query.total) || 0;
  const privatetransferprice = parseFloat(req.query.privatetransferprice) || 0;
  const order_date = req.query.order_date;
  const total_persones = adults_no + kids_no;

  try {
    const products = await Productes.findById(productId);
    if (!products) {
      return res.status(404).json({ error: "Product not found" });
    }

    const product_Quantity = products.quantity;
    const payments = await Payment.find();

    let totalAdults = 0;
    let totalKids = 0;

    function areDatesEqual(date1, date2) {
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      d1.setHours(0, 0, 0, 0);
      d2.setHours(0, 0, 0, 0);
      return d1.getTime() === d2.getTime();
    }

    // ✅ Check: PRIVATE transfer already booked
    if (transfertype === "Private") {
      const isAlreadyPrivateBooked = payments.some((payment) =>
        payment.products.some(
          (product) =>
            areDatesEqual(product.order_date, order_date) &&
            product.productId === productId &&
            product.transfertype === "Private"
        )
      );

      if (isAlreadyPrivateBooked) {
        return res.status(409).json({
          message: "Private transfer already booked for this date.",
        });
      }
    }

    // ✅ Check: SHARED transfer quantity available
    if (transfertype !== "Private") {
      payments.forEach((payment) => {
        payment.products.forEach((product) => {
          if (
            areDatesEqual(product.order_date, order_date) &&
            product.productId === productId
          ) {
            totalAdults += product.adults_no || 0;
            totalKids += product.kids_no || 0;
          }
        });
      });

      const totalBookedPersons = totalAdults + totalKids;

      if (product_Quantity < totalBookedPersons + total_persones) {
        const value = product_Quantity - totalBookedPersons;
        return res.status(409).json({
          value,
          message: "Not enough quantity available for selected date.",
        });
      }
    }

    // ✅ Prepare product data
    const product = {
      id: products._id,
      cityName: products.cityName,
      citydescription: products.citydescription,
      cityImage: products.cityImage,
      tourService: products.tourService,
      duration: products.duration,
      privateAdult: products.privateAdult,
      privateChild: products.privateChild,
      transportService: products.transportService,
      private: products.private,
      pickUp: products.pickUp,
      producttitle: products.producttitle,
      discountPercentage: products.discountPercentage,
      discountedTotal: products.discountedTotal,
      discountend: products.discountend,
      privatetransferprice: products.privatetransferprice,
      quantity: products.quantity,
      productdescription: products.productdescription,
      categorie: products.categorie,
      thumbnail: products.thumbnail,
      adultBaseprice: products.adultBaseprice,
      kidsBaseprice: products.kidsBaseprice,
      translatelanguage: products.translatelanguage,
      wifi: products.wifi,
    };

    // ✅ Create cart item
    const cartItem = {
      productId,
      transfertype,
      adults_no,
      kids_no,
      privateAdult,
      privateChild,
      total,
      privatetransferprice,
      order_date,
      ...product,
    };

    // ✅ Add to session cart
    if (!req.session.cart) {
      req.session.cart = [];
    }

    const itemIndex = req.session.cart.findIndex(
      (item) => item.productId === productId
    );

    if (itemIndex === -1) {
      req.session.cart.push(cartItem);
    } else {
      req.session.cart[itemIndex] = cartItem;
    }

    // ✅ Respond success
    res.status(200).json({ status: 200, cart: req.session.cart });
  } catch (error) {
    console.error("Error fetching product data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// ============ get personal function end ================

// ============== Module Exports ================

module.exports = {
  postpersonal,
  getpersonal,
};
