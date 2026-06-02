import jwt from "jsonwebtoken";


function authMiddleware(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Access denied. No token provided." });
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; 
      next();
    } catch (err) {
      console.log(err);
      
      res.status(403).json({ 
        error: err
       });
    }
  }
export default authMiddleware;  