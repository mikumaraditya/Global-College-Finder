import express from "express";
import dotenv from "dotenv";
import connectDB from "../database/db.js";
import Institute from "./dataModels.js"

dotenv.config({path:"./config.env"});
const app = express();
const PORT = process.env.PORT || 8000;


connectDB();

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
  
app.listen(PORT,()=>{
    console.log(`Server is running at ${PORT} `);
})