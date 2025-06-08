require('dotenv').config();
const express=require('express');
const app=express();
const mongoose = require('mongoose');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');

const routes = require('./src/routes');
const { errorMiddleware } = require('./src/middlewares/errorMiddleware');

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());
app.use(express.static(path.join(__dirname, 'src', 'public')))
app.use(fileUpload());

app.get('/health',(req,res)=>{
    res.status(200).send({success:true});
})

app.use('/webservice/api', routes);

app.use(errorMiddleware);

mongoose.connect(process.env.MONGO_CONNECTION_STRING)
.then(()=>{
    console.log('MongoDB connected');  
    
    app.listen(process.env.PORT, ()=>{
        console.log('server is running at port: ', process.env.PORT);
    })
})
.catch(error=>{
    console.log('Error in MongoDB connection ', error);
})


