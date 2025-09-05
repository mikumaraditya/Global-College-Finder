import express from "express";
import Institute from "../models/dataModels.js";
import authMiddleware from "../auth/auth.js";

const router = express.Router();

router.get("/colleges", async (req, res) => {
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


export default router;