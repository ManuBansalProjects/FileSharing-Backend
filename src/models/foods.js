const  mongoose = require("mongoose");

const FoodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    group: {
      type: String,
      required: true,
    },
    calories: {
      type: Number,
      required: true,
    },
    serving: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("foods", FoodSchema);
