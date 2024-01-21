import Express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = Express();

app.use(
  cors({
    origin: process.env.CORS_URL, // Use process.env.CORS_URL without quotes
    credentials: true,
  })
);

app.use(Express.json({ limit: "16kb" }));
app.use(Express.urlencoded({ extended: true, limit: "16kb" }));
app.use(Express.static("public"));
app.use(cookieParser());

import userRouter from "./routes/user.route.js";
app.use('/app/v1/user', userRouter);

export default app;
