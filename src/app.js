import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import interviewerRoute from "./routes/interviewer.routes.js";
import candidateRoute from "./routes/candidate.routes.js";
dotenv.config();

const app = express();

// ✅ CORS config that allows all origins (for development only)
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Allow non-browser clients like curl
    return callback(null, true); // Allow all origins
  },
  credentials: true, // ✅ Allow cookies
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is reachable" });
});
app.use("/api/auth", interviewerRoute);
app.use("/api/candidate", candidateRoute);

export default app;
