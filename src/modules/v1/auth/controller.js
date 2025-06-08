const userModel = require('../../../models/users');
const { getJWTToken, sendEmail, decodeToken, hashPassword, matchPassword } = require('../../../utils/helperFunctions');
const { CustomError } = require('../../../utils/customError');

module.exports = {
    register : async(req, res, next) =>{
        try {
            const {name, email, password} = req.body;
            const data = {
                name,
                email,
                password,
                access_type : 'registration'
            }
            const token = getJWTToken(data, 300);            

            const emailSubject = 'Verify your email for registration!'
            const emailVerifyLink = `${process.env.WEB_URL}/verify-user/${token}`;
            const emailText = `Please click on the link given below to verify your email \n ${emailVerifyLink}`
            sendEmail(email, emailSubject, emailText);

            res.status(201)
            .json({success : true, message : 'Please check your email for verification'});
        } catch (error) {
            next(error);
        }
    },
    verifyLink : async(req, res, next) =>{
        try {
            let { token, new_password, confirm_password } = req.body;

            const decodedToken =  decodeToken(token);

            if(decodedToken.access_type == 'registration'){
                const userData = {
                    name : decodedToken.name,
                    email : decodedToken.email,
                    password : await hashPassword(decodedToken.password)
                }        
                const userCreated = await userModel.create(userData);
                const accessToken = getJWTToken({_id : userCreated._id, access_type : 'access-token'}, '1d');

                const responseData = {
                    _id : userCreated._id,
                    access_token : accessToken,
                    name : userCreated.name,
                    email : userCreated.email
                }
                return res
                .status(200)
                .json({success : true, message : 'User verified successfully', data : responseData});

            }else if(decodedToken.access_type == 'forgot-password'){
                if(new_password != confirm_password){
                    throw new CustomError(400, 'Password not matched', 'verifyLink');
                }
                await userModel.updateOne({_id : decodedToken._id}, {password : await hashPassword(new_password)});
                
                return res
                .status(200)
                .json({success : true, message : 'Password reset successfully'});
            }

        } catch (error) {
            next(error);
        }
    },
    forgotPassword : async(req, res, next) =>{
        try {
            const {email} = req.body;

            const user = await userModel.findOne({email});
            const data = {
                _id : user._id,
                access_type : 'forgot-password'
            }
            const token = getJWTToken(data, 300);            

            const emailSubject = 'Verify your email to reset the passwrd!'
            const emailVerifyLink = `${process.env.WEB_URL}/reset-password/${token}`;
            const emailText = `Please click on the link given below to reset your password \n ${emailVerifyLink}`
            sendEmail(email, emailSubject, emailText);

            res.status(201)
            .json({success : true, message : 'Please check your email to reset your password'});
        } catch (error) {
            next(error);
        }
    },
    login : async(req, res, next) =>{
        try {
            const {email, password} = req.body;

            const user = await userModel.findOne({email});
            if(!user || !await matchPassword(password, user.password)){
                throw new CustomError(401, 'Invalid credentials', 'login');
            }

            const data = { 
                _id : user._id, 
                access_type : 'access-token'
            }
            const accessToken = getJWTToken(data, '1d');            

            const responseData = {
                _id : user._id,
                access_token : accessToken,
                name : user.name,
                email : user.email
            }
            res.status(201)
            .json({success : true, message : 'Logged in successfully', data : responseData});
        } catch (error) {
            next(error);
        }
    },
}