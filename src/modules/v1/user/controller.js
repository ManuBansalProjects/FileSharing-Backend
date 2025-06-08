const userModel = require('../../../models/users');
const { CustomError } = require('../../../utils/customError');
const { matchPassword, hashPassword } = require('../../../utils/helperFunctions');

module.exports = {
    updateProfile : async(req, res, next) =>{
        try {
            const {name} = req.body;
            const userId = req.user._id;

            const data = {
                name
            }
            await userModel.updateOne({_id : userId}, data);

            res
            .status(201)
            .json({success : true, message : 'User updated successfully'});
        } catch (error) {
            next(error);
        }
    },
    changePassword : async(req, res, next) =>{
        try {
            const { old_password, new_password, confirm_password } = req.query;
            const userId = req.user._id;

            if(!matchPassword(old_password, req.user.password)){
                throw new CustomError(400, 'Old Password not matched', 'changePassword');
            }else if(new_password != confirm_password){
                throw new CustomError(400, 'Confirm Password not matched', 'changePassword');
            }else if(old_password == new_password ){
                throw new CustomError(400, 'Old and new password can\'t be same', 'changePassword');
            }

            await userModel.updateOne({_id : userId}, {password : hashPassword(new_password)});
            
            res
            .status(200)
            .json({success : true, message : 'Password updated successfully'});
        } catch (error) {
            console.log(error);    
            next(error);
        }
    },
}