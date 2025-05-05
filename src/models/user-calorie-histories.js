const  mongoose = require("mongoose");

const UserCalorieHistorySchema = new mongoose.Schema(
  {
    user_id : { type : mongoose.Types.ObjectId, ref : 'users', required : true },
    // height: {
    //   type: Number,
    //   required: true,
    // },
    // weight: {
    //   type: Number,
    //   required: true,
    // },
    // age: {
    //   type: Number,
    //   required: true,
    // },
    history_date: {
      type: Date,
      required: true,
    },
    foods: [{
        food_id : { type : mongoose.Types.ObjectId, ref : 'foods' },
        quantity : { type : Number },
        total_calories : { type : Number }
    }],
    activities: [{
        activity_id : { type : mongoose.Types.ObjectId, ref : 'activities' },
        minutes : { type : Number },
        total_calories : { type : Number }
    }],
    total_food_calories: {
      type: Number,
      required: true,
    },
    total_activity_calories: {
      type: Number,
      required: true,
    },
    bmr: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("user-calorie-histories", UserCalorieHistorySchema);
