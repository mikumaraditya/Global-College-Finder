import express from "express";
import Institute from "../models/dataModels.js";
import authMiddleware from "../auth/auth.js";

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
      
      if (!colleges.length) {
        const distinctCountries = await Institute.distinct("country");
        const suggestion = findClosestCountry(countryName, distinctCountries);
        if (suggestion) {
          return res.status(404).json({ 
            message: `No colleges found in "${countryName}". Did you mean "${suggestion}"?` 
          });
        }
        return res.status(404).json({ message: `No colleges found in "${countryName}".` });
      }
  
      res.json(colleges);
    } catch (err) {
      console.error("Database query error:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

export default router;