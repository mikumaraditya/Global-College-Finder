import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./database/db.js";
import dataRouter from "./router/dataRouter.js";
import contactRoute from "./router/contactRoute.js";
import userRoute from "./router/userRoute.js";
import authMiddleware from "./auth/auth.js";


dotenv.config({path:"./config.env"});
const app = express();
const PORT = process.env.PORT ;
app.use(cookieParser());


connectDB();



app.use(express.json());
app.use(cors({
  origin: "https://global-college-finder.vercel.app",
  credentials: true
}));


app.use(dataRouter);
app.use(contactRoute);
app.use(userRoute);

app.get("/auth",authMiddleware,(req,res)=>{
    res.status(200).json({
        success: true
    });
});

app.listen(PORT,()=>{
    console.log(`Server is running at ${PORT} `);
})