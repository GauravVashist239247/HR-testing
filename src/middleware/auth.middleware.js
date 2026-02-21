import jwt from "jsonwebtoken";
import { Interviewer } from "../models/interviewer.model.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await Interviewer.findById(decoded.id);

    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized" });
  }
};
