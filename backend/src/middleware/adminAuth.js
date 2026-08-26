import { config } from "../config.js";

export function requireAdmin(req, res, next) {
  const auth = req.header("Authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length) : "";
  if (!token || token !== config.adminToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}
