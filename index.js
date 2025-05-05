require('dotenv').config();
const express=require('express');
const app=express();
const mongoose = require('mongoose');
const cors = require('cors');

const routes = require('./src/routes');
const {loadExcelFilesToDB} = require('./src/utils/helperFunctions');

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());

app.get('/health',(req,res)=>{
    res.status(200).send({success:true});
})

app.use('/webservice/api', routes);

mongoose.connect(process.env.MONGO_CONNECTION_STRING)
.then(()=>{
    console.log('MongoDB connected');  
    loadExcelFilesToDB();
    app.listen(process.env.PORT, ()=>{
        console.log('server is running at port: ', process.env.PORT);
    })
})
.catch(error=>{
    console.log('Error in MongoDB connection ', error);
})




