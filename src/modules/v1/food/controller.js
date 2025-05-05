const foodModel = require('../../../models/foods');
const actiivityModel = require('../../../models/activities');
const userCaloryHistoryModel = require('../../../models/user-calorie-histories');

module.exports = {
    getAllFoodGroups : async(req, res) =>{
        try {
            const foodGroups = await foodModel.aggregate([
                {
                  $group: {
                    _id: "$group",
                    foods: {
                      $push: {
                        food_id : "$_id",
                        name: "$name",
                        calories : '$calories',
                        serving : '$serving'
                      }
                    }
                  }
                },
                {
                  $project: {
                    _id: 0,
                    group: "$_id",
                    foods: 1
                  }
                }
            ]);
              
            res
            .status(200)
            .json({success : true, message : 'Success', data : {foodGroups}});
        } catch (error) {
            
        }
    },
}