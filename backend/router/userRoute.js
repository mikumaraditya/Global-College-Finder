import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import userModel from "../models/userModel.js";
import reqBody from "../validators/validate.js";


const router = express.Router();



router.post("/signup", async (req, res) => {
    try {
     
      const parsedData = await reqBody.safeParseAsync(req.body);
  
      if (!parsedData.success) {
        return res.status(400).json({
          message: parsedData.error.issues[0].message,
        });
      }
  
      const { email, password } = parsedData.data;
      const hashedPass = await bcrypt.hash(password, 10);
  
      await userModel.create({
        email: email,
        password: hashedPass,
      });
  
      res.status(201).json({
        message: "User signed up successfully ✅",
      });
  
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          message: "A user with this email already exists 🚨"
        });
      }
  
      console.error("Signup error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  router.post("/signin", async (req, res) => {
    try {
      
      const parsedData = await reqBody.safeParseAsync(req.body);
  
      if (!parsedData.success) {
        return res.status(400).json({
          message: parsedData.error.issues[0].message,
        });
      }
  
      const { email, password } = parsedData.data;
  
      const user = await userModel.findOne({
        email: email
      }); 
       
        
      if (!user) {
        return res.status(400).json({ error: "User not found! Please First Signup" });
      }
      const isMatch = await bcrypt.compare(password, user.password);
     
      
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid password" });
      } else {
        const token = jwt.sign( { id: user._id}, process.env.JWT_SECRET,{ expiresIn: "1d" });
        
        
        res.cookie("token", token, {
          httpOnly: true,
          secure: true,       
          sameSite: "none",
          maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        
        res.status(200).json({
          message: "User signed in successfully",
          success:true
        });
      }
  
    } catch (error) {
      
      res.status(400).json({ error: "User not found" });
    }
  });

  router.post("/logout", (req, res) => {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });
    res.json({ success: true, message: "Logged out successfully" });
  });



  export default router;