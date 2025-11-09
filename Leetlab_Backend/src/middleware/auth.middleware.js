import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

// attach req.user if JWT is valid (from cookie `jwt` or `Authorization: Bearer <token>`)
export const authMiddleware = async (req, res, next) => {
  try {
    let token =
      req.cookies?.jwt ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ error: "User not found" });

    req.user = user; // { _id, email, name, role, ... }
    next();
  } catch (err) {
    console.error("authMiddleware error:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// require ADMIN role
export const checkAdmin = (req, res, next) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};
