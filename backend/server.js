import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import nodemailer from "nodemailer";
import connectDB from "./database/db.js";
import Institute from "./models/dataModels.js"

dotenv.config({path:"./config.env"});
const app = express();
const PORT = process.env.PORT || 8000;


connectDB();

app.use(express.json());
app.use(cors({
  origin: "https://global-college-finder.vercel.app",
  credentials: true
}));


app.get("/colleges", async (req, res) => {
    try {
      const countryName = req.query.country;
      if (!countryName) {
        return res.status(400).json({ message: "Country is required" });
      }
  
     
      const colleges = await Institute.find({
        country:  { 
            $regex: new RegExp(`^${countryName}$`,"i") 
            }
      });
      
      if (!colleges.length) {
        return res.status(404).json({ message: "No colleges found in this country." });
      }
  
      res.json(colleges);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/send-email", async (req, res) => {
    const { firstName, lastName, email, message, communication, dataConsent } = req.body;
  
  
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,        
        pass: process.env.PASSWORD          
      }
    });
  
   
    const mailOptions = {
      from: process.env.EMAIL,        
      to: "collegeatlas.info@gmail.com",           
      subject: `New Contact Form Submission from ${firstName} ${lastName}`,
      text: `
  First Name: ${firstName}
  Last Name: ${lastName}
  Email: ${email}
  Message: ${message}
  Agreed to Communication: ${communication}
  Agreed to Data Storage: ${dataConsent}
      `
    };
  
    try {
      await transporter.sendMail(mailOptions);
      res.json({ success: true, message: "Email sent successfully!" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ success: false, message: "Failed to send email" });
    }
  });
  

app.listen(PORT,()=>{
    console.log(`Server is running at ${PORT} `);
})