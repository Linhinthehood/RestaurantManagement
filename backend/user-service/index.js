import express from 'express';
import dotenv from 'dotenv';
import { connecttoDB } from './config/db.js';
import  AppRouter from './routes/index.js'
dotenv.config();
connecttoDB();
const app = express();
const PORT = process.env.PORT ;
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.get('/',(req,res)=>{
  res.send("Welcome to RM sever");
});
app.use('/api',AppRouter);
app.use((err,res,req,next)=>{
  console.error(err.stack);
  res.status(500).send('something went wrong');
});
app.listen(PORT ,()=>{
  console.log(`Sever is running in  ${ process.env.NODE_ENV|| 'development'} mode  on port ${PORT}`);
  
});