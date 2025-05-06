const foodModel = require('../../../models/foods');
const actiivityModel = require('../../../models/activities');
const userCaloryHistoryModel = require('../../../models/user-calorie-histories');

module.exports = {
    getAllActivityCategories : async(req, res, next) =>{
        try {
            const activityCategories = await actiivityModel.aggregate([
                {
                  $group: {
                    _id: "$name",
                    activities: {
                      $push: {
                        activity_id : "$_id",
                        name: "$category",
                        met_value : "$met_value"
                      }
                    }
                  }
                },
                {
                  $project: {
                    _id: 0,
                    category: "$_id",
                    activities: 1
                  }
                }
            ]);
              
            res
            .status(200)
            .json({success : true, message : 'Success', data : {activityCategories}});
        } catch (error) {
            next(error);
        }
    },
}