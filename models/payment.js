const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
  },
  producttitle: String,
  productdescription: String,
  cityName: String,
  citydescription: String,
  cityImage: String,
  tourService: String,
  duration: String,
  transportService: String,
  pickUp: String,
  price: Number,
  discountedTotal: Number,
  discountPercentage: Number,
  adultBaseprice: Number,
  kidsBaseprice: Number,
  quantity: Number,
  thumbnail: [String],
  categorie: String,
  translatelanguage: String,
  wifi: String,
  adults_no: {
    type: Number,
  },
  transfertype: {
    type: String,
  },
  kids_no: {
    type: Number,
  },
  total: {
    type: Number,
  },
  order_date: {
    type: String,
    required: true,
  },

  privateAdult: {
    type: Number,
  },
  privateChild: {
    type: Number,
  },
  privatetransferprice: {
    type: Number,
  },
});

const paymentschema = new mongoose.Schema(
  {
    products: [productSchema], // ✅ Full product schema embedded

    userId: {
      type: Object,
    },

    userName: {
      type: String,
    },

    userEmail: {
      type: String,
    },

    first_name: {
      type: String,
      required: true,
    },

    last_name: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    payment_Method: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    country: {
      type: String,
      required: true,
    },

    name_On_Card: {
      type: String,
      required: true,
    },

    card_Number: {
      type: String,
      required: true,
    },

    zip: {
      type: Number,
      required: true,
    },

    expiry: {
      type: String,
      required: true,
    },
    cvv: {
      type: String,
      required: true,
    },
    // date: {
    //   type: String,
    //   required: true
    // }
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentschema);
module.exports = Payment;
