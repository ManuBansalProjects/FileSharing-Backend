const mongoose = require('mongoose');
const foodModel = require('../../../models/foods');
const actiivityModel = require('../../../models/activities');
const userCaloryHistoryModel = require('../../../models/user-calorie-histories');
const {CustomError} = require('../../../utils/customError');
const ObjectId = mongoose.Types.ObjectId;

module.exports = {
    addUserCalories : async(req, res, next) =>{
        try {
            let { user_id, history_date, foods, activities, total_food_calories, 
              total_activity_calories, bmr } 
            = req.body;
            
            const filter = {
              user_id,
              history_date : new Date(history_date)
            }
            const historyExists = await userCaloryHistoryModel.findOne(filter);
            if(historyExists){
              throw new CustomError(400, 'History date already exists', 'addUserCalories');
            }

            foods = foods.map(food =>({
              food_id : food.food_id,
              quantity : food.quantity,
              total_calories : food.total_calories
            }))

            activities = activities.map(activity =>({
              activity_id : activity.activity_id,
              minutes : activity.minutes,
              total_calories : activity.total_calories
            }))

            const data = {
                user_id,
                history_date : new Date(history_date),
                foods,
                activities,
                total_food_calories,
                total_activity_calories,
                bmr
            }
            await userCaloryHistoryModel.create(data);
            
            res
            .status(201)
            .json({success : true, message : 'Calories added successfully'});
        } catch (error) {
            next(error);
        }
    },
    listUserCalories : async(req, res, next) =>{
        try {
            let { user_id, skip, limit } = req.query;
            skip = skip || 0;
            limit = limit || 10;

            const calories = await userCaloryHistoryModel.find({user_id})
              .skip(skip)
              .limit(limit)
              .select('history_date total_food_calories total_activity_calories bmr');
            const count = await userCaloryHistoryModel.countDocuments({user_id});   

            res
            .status(200)
            .json({success : true, message : 'Success', data : { calories, count }});
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    getUserCalories : async(req, res, next) =>{
        try {
            let { _id } = req.query;
            const userCalories = await userCaloryHistoryModel.aggregate([
              {
                $match: { _id: new ObjectId(_id) } // or any condition
              },
              {
                $unwind: "$foods" // flatten items array for join
              },
              {
                $lookup: {
                  from: "foods",
                  localField: "foods.food_id",
                  foreignField: "_id",
                  as: "foods.food"
                }
              },
              {
                $unwind: "$foods.food" // optional: flatten joined product array
              },
              {
                $group: {
                  _id: "$_id",
                  history_date : { $first: "$history_date" },
                  total_food_calories : { $first: "$total_food_calories" },
                  total_activity_calories : { $first: "$total_activity_calories" },
                  bmr : { $first: "$bmr" },
                  activities : { $first: "$activities" },
                  foods: {
                    $push: {
                      group : "$foods.food.group",
                      serving : "$foods.food.serving",
                      calories : "$foods.food.calories",
                      food_id : "$foods.food_id",
                      quantity: "$foods.quantity",  
                      total_calories : "$foods.total_calories",                      
                    }
                  },
                }
              },
              {
                $unwind: "$activities" // flatten items array for join
              },
              {
                $lookup: {
                  from: "activities",
                  localField: "activities.activity_id",
                  foreignField: "_id",
                  as: "activities.activity"
                }
              },
              {
                $unwind: "$activities.activity" // optional: flatten joined product array
              },
              {
                $group: {
                  _id: "$_id",
                  history_date : { $first: "$history_date" },
                  total_food_calories : { $first: "$total_food_calories" },
                  total_activity_calories : { $first: "$total_activity_calories" },
                  bmr : { $first: "$bmr" },
                  foods: { $first: "$foods" },
                  activities: {
                    $push: {
                      category : "$activities.activity.name",
                      activity_id : "$activities.activity_id",
                      minutes: "$activities.minutes",  
                      total_calories : "$activities.total_calories",                      
                    }
                  }
                }
              },
            ]);
            
            res
            .status(200)
            .json({success : true, message : 'Success', data : {userCalories : userCalories[0] || {}}});
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    updateUserCalories : async(req, res, next) =>{
        try {
            let { _id, user_id, history_date, foods, activities, total_food_calories, total_activity_calories, bmr } 
            = req.body;

            const filter = {
              user_id,
              history_date : new Date(history_date),
              _id : { $ne : new ObjectId(_id) }
            }
            const historyExists = await userCaloryHistoryModel.findOne(filter);
            if(historyExists){
              throw new CustomError(400, 'History date already exists', 'updateUserCalories');
            }

            foods = foods.map(food =>({
              food_id : food.food_id,
              quantity : food.quantity,
              total_calories : food.total_calories
            }))

            activities = activities.map(activity =>({
              activity_id : activity.activity_id,
              minutes : activity.minutes,
              total_calories : activity.total_calories
            }))

            const updateData = {
                history_date : new Date(history_date),
                foods,
                activities,
                total_food_calories,
                total_activity_calories,
                bmr
            }
            await userCaloryHistoryModel.updateOne({_id : _id}, updateData);
            
            res
            .status(200)
            .json({success : true, message : 'Calories updated successfully'});
        } catch (error) {
            next(error);
        }
    },
    deleteUserCalories : async(req, res, next) =>{
        try {
            let { _id } = req.query;
            await userCaloryHistoryModel.deleteOne({_id : _id});
            
            res
            .status(200)
            .json({success : true, message : 'Calories deleted successfully'});
        } catch (error) {
            next(error);
        }
    },
}