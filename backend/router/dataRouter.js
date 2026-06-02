import express from "express";
import Institute from "../models/dataModels.js";
import authMiddleware from "../auth/auth.js";
import axios from "axios";

const router = express.Router();

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

function getLevenshteinDistance(a, b) {
  const tmp = [];
  let i, j;
  for (i = 0; i <= a.length; i++) {
    tmp[i] = [i];
  }
  for (j = 0; j <= b.length; j++) {
    tmp[0][j] = j;
  }
  for (i = 1; i <= a.length; i++) {
    for (j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1,
        tmp[i][j - 1] + 1,
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return tmp[a.length][b.length];
}

function findClosestCountry(input, countries) {
  const cleanInput = input.trim().toLowerCase();
  if (!cleanInput) return null;
  
  // 1. Check for exact substring match (e.g. "indi" -> "India")
  for (const country of countries) {
    const cleanCountry = country.toLowerCase();
    if (cleanCountry.includes(cleanInput) || cleanInput.includes(cleanCountry)) {
      return country;
    }
  }
  
  // 2. Levenshtein distance suggestion
  let bestMatch = null;
  let minDistance = 4; // Max distance threshold
  
  for (const country of countries) {
    const distance = getLevenshteinDistance(cleanInput, country.toLowerCase());
    if (distance < minDistance) {
      minDistance = distance;
      bestMatch = country;
    }
  }
  
  return bestMatch;
}

router.get("/colleges", authMiddleware, async (req, res) => {
    try {
      const countryName = req.query.country;
      if (!countryName) {
        return res.status(400).json({ message: "Country is required" });
      }
  
      // 1. Query MongoDB first
      let colleges = await Institute.find({
        country: { 
          $regex: new RegExp(`^${escapeRegex(countryName)}$`, "i") 
        }
      });
      
      // 2. If not found, fetch from external API and write-through cache it to MongoDB
      if (!colleges.length) {
        console.log(`Cache miss for "${countryName}". Querying external API...`);
        try {
          const apiRes = await axios.get("https://universities.hipolabs.com/search?country=" + encodeURIComponent(countryName));
          
          if (apiRes.data && apiRes.data.length > 0) {
            const collegesToInsert = apiRes.data.map(uni => ({
              name: uni.name,
              domains: uni.domains || [],
              web_pages: uni.web_pages || [],
              country: uni.country,
              alpha_two_code: uni.alpha_two_code || "",
              state_province: uni["state-province"] || null
            }));
            
            // Bulk insert into MongoDB
            await Institute.insertMany(collegesToInsert);
            console.log(`Successfully cached ${collegesToInsert.length} colleges for "${countryName}" in MongoDB.`);
            
            // Re-fetch from DB to return consistent data structures
            colleges = await Institute.find({
              country: { 
                $regex: new RegExp(`^${escapeRegex(countryName)}$`, "i") 
              }
            });
          } else {
            const distinctCountries = await Institute.distinct("country");
            const suggestion = findClosestCountry(countryName, distinctCountries);
            if (suggestion) {
              return res.status(404).json({ 
                message: `No colleges found in "${countryName}". Did you mean "${suggestion}"?` 
              });
            }
            return res.status(404).json({ message: `No colleges found in "${countryName}".` });
          }
        } catch (apiErr) {
          console.error("External API request failed:", apiErr.message);
          const distinctCountries = await Institute.distinct("country");
          const suggestion = findClosestCountry(countryName, distinctCountries);
          
          if (!apiErr.response) {
            if (suggestion) {
              return res.status(404).json({ 
                message: `No local records found, and the external search directory is offline. Did you mean "${suggestion}"?` 
              });
            }
            return res.status(404).json({ 
              message: "No local records found, and the external search directory is offline. Please check your internet connection or search spelling." 
            });
          }
          
          if (suggestion) {
            return res.status(404).json({ 
              message: `No colleges found in "${countryName}". Did you mean "${suggestion}"?` 
            });
          }
          return res.status(500).json({ message: "Error fetching data from external directory" });
        }
      }
  
      res.json(colleges);
    } catch (err) {
      console.error("Database query error:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

export default router;