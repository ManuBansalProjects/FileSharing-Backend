const xlsx = require("xlsx");
const fs = require("fs/promises");
const path =  require('path');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

const getJWTToken = (data, time)=>{
    const token = jwt.sign(data, process.env.JWT_SECRET_KEY, {expiresIn : time})
    return token;
}

const sendEmail = (email, subject, text)=>{
        
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to: email,
        subject: subject,
        text: text
    };

    console.log(process.env.SMTP_EMAIL, process.env.SMTP_PASSWORD)
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

const decodeToken = (token)=>{
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    return decodedToken;
}

const hashPassword =async (password)=>{
    const hashedPassword = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS));
    return hashedPassword;
}

const matchPassword = async(password, hashedPassword)=>{
    return await bcrypt.compare(password, hashedPassword);
}

module.exports = {getJWTToken, sendEmail, decodeToken, hashPassword, matchPassword}