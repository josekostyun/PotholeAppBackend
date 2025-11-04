import jwt from "jsonwebtoken";

// ---------------------------------------------
// VERIFY JWT TOKEN
// ---------------------------------------------
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    req.user = decoded; // contains id, role
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

// ---------------------------------------------
// ROLE-BASED AUTHORIZATION
// ---------------------------------------------
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access forbidden: insufficient role" });
    }
    next();
  };
};