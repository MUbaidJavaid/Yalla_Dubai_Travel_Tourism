// ============ User define imports Start ================

const Productes = require("../models/productes");

// ============ User define imports end  ================

// ============= get home function Start ===============

async function gethome(req, res) {
  try {
    const products = await Productes.find({});

    const distinctCities = await Productes.aggregate([
      {
        $group: {
          _id: "$cityName",
          cityImage: { $first: "$cityImage" }, // Pick the first image for the city
        },
      },
      {
        $project: {
          cityName: "$_id",
          cityImage: 1,
          _id: 0,
        },
      },
    ]);


    res.json({ products, distinctCities });
  } catch (err) {
    console.log("Err on home page:", err);
    res.status(500).send("Internal Server Error");
  }
}

// ============= get home function end ===============

// ============= get product function Start ===============

async function getproduct(req, res) {
  const productId = req.query.id; 

  try {
    const products = await Productes.findById(productId);
    if (!products) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ products }); // Pass product data to the template
  } catch (error) {
    console.error("Error fetching product data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// ============= get product function end ===============

async function getCity(req, res) {
  const cityName = req.query.cityName;
  try {
    const cities = await Productes.find({ cityName: cityName });

    if (!cities.length) {
      return res.status(404).json({ error: "No products found" });
    }
    res.json({ producte: cities, cityName });
  } catch (error) {
    console.error("Error fetching product data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// ============= get remove from cart function Start ===============

function removefromcart(req, res) {
  const productId = req.query.productId;

  if (!req.session.cart || !productId) {
    return res.status(400).json({
      status: 400,
      message: "Cart not found and invalid id",
    });
  }

  req.session.cart = req.session.cart.filter(
    (item) => item.productId !== productId
  );

  if (req.session.cart.length === 0) {
    req.session.cart = []; 
    return res.json({ status: 200, message: "if the cart is now empty" }); // Redirect to home or products page
  } else {
    return res.status(200).json({
      status: 200,
      message: "Item removed from cart",
      cart: req.session.cart,
    });
  }


}

// ============= get remove from cart function end ===============

// ============== Module Exports ================

module.exports = {
  gethome,
  removefromcart,
  getproduct,
  getCity,
};
