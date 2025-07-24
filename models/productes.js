const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    cityName: {
      type: String,
      required: true,
    },
    citydescription: {
      type: String,
      required: true,
    },
    cityImage: {
      type: String,
      required: true,
    },
    cityImage1: {
      type: String,
    },
    tourService: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    transportService: {
      type: String,
      required: true,
    },
    pickUp: {
      type: String,
      required: true,
    },
    producttitle: {
      type: String,
      required: true,
    },
    productdescription: {
      type: String,
      required: true,
    },
    discountend: {
      type: Date,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    discountPercentage: {
      type: Number,
      required: true,
    },
    private: {
      type: Boolean,
    },
    shared: {
      type: Boolean,
    },

    privateAdult: {
      type: Number,
    },
    privateChild: {
      type: Number,
    },
    discountedTotal: {
      type: Number,
      required: true,
    },
    thumbnail: {
      type: [String],
      required: true,
    },
    thumbnail1: {
      type: String,
    },
    thumbnail2: {
      type: String,
    },
    thumbnail3: {
      type: String,
    },
    adultBaseprice: {
      type: Number,
      required: true,
    },
    kidsBaseprice: {
      type: Number,
      required: true,
    },
    privatetransferprice: {
      type: Number,
    },
    categorie: {
      type: String,
      required: true,
    },
    translatelanguage: {
      type: String,
      required: true,
    },
    wifi: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Productes = mongoose.model("Product", productSchema);
module.exports = Productes;
