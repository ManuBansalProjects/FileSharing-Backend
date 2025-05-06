const userModel = require('../../../models/users');
const userCaloryHistoryModel = require('../../../models/user-calorie-histories');

module.exports = {
    create : async(req, res, next) =>{
        try {
            const {name, gender, age, height, weight} = req.body;
            const data = {
                name,
                gender,
                age,
                height,
                weight
            }
            await userModel.create(data);

            res
            .status(201)
            .json({success : true, message : 'User created successfully'});
        } catch (error) {
            next(error);
        }
    },
    list : async(req, res, next) =>{
        try {
            let { skip, limit } = req.query;
            skip = skip || 0;
            limit = limit || 10;

            const users = await userModel.find().skip(skip).limit(limit);
            const count = await userModel.countDocuments();   

            res
            .status(200)
            .json({success : true, message : 'success', data : { users, count }});
        } catch (error) {
            console.log(error);    
            next(error);
        }
    },
    get : async(req, res) =>{
        try {
            let { _id } = req.query;
            const user = await userModel.findOne({_id});
            
            res
            .status(200)
            .json({success : true, message : 'Success', data : {user}});
        } catch (error) {
            next(error);
        }
    },
    update : async(req, res, next) =>{
        try {
            const {_id, name, gender, age, height, weight} = req.body;
            const updateData = {
                name,
                gender,
                age,
                height,
                weight
            }
            await userModel.updateOne({_id}, updateData);

            res
            .status(200)
            .json({success : true, message : 'User updated successfully'});
        } catch (error) {
            next(error);
        }
    },
    delete : async(req, res, next) =>{
        try {
            let { _id } = req.query;
            await userCaloryHistoryModel.deleteMany({user_id : _id});
            await userModel.deleteOne({_id});
            
            res
            .status(200)
            .json({success : true, message : 'User deleted successfully'});
        } catch (error) {
            next(error);
        }
    },
}