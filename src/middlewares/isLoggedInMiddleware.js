const { CustomError } = require("../utils/customError");
const { decodeToken } = require("../utils/helperFunctions");
const userModel = require('../models/users');

const isLoggedInMiddleware = async(req, res, next) =>{
    try{
        const accessTokenString = req.headers?.authorization;
        if(!accessTokenString){
            throw new CustomError(401, 'Session expired', 'isLoggedInMiddleware');
        }

        const accessToken = accessTokenString.split(' ')[1];
        if(!accessToken){
            throw new CustomError(401, 'Session expired', 'isLoggedInMiddleware');
        }
        
        const decodedToken = decodeToken(accessToken);
        if(decodedToken.access_type != 'access-token'){
            throw new CustomError(401, 'Session expired', 'isLoggedInMiddleware');
        }

        const user = await userModel.findOne({_id : decodedToken._id});
        if(!user){
            throw new CustomError(401, 'User not exists', 'isLoggedInMiddleware');
        }

        req.user = user;
        next();
    }catch(error){
        next(error)
    }
}

module.exports = isLoggedInMiddleware