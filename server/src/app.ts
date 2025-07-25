import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors, { CorsOptions } from "cors";
import helmet from "helmet";
import ErrorMiddleware from "./middlewares/error";

import chats from "./routes/chat.routes";
import auth from './routes/auth.routes';
import dashboard from './routes/dashboard.routes';
import profile from './routes/profile.routes';
import admin from "./routes/admin.routes";
import notifications from "./routes/notifications.routes";

const app = express();

const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = [
            "http://localhost:5173",
            "http://localhost:5174",
        ];

        if (!origin || allowedOrigins.includes(origin as string)) {
            callback(null, origin);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: "GET, POST, PUT, DELETE, PATCH, HEAD",
    credentials: true,
};

app.set('trust proxy', 1);
app.use(cors(corsOptions));
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json({ limit: "50mb" }));
app.use(express.static("public"));

app.use("/api/v1/chats", chats);
app.use("/api/v1/admin", admin);
app.use("/api/v1/auth", auth);
app.use("/api/v1/dashboard", dashboard);
app.use("/api/v1/profile", profile);
app.use("/api/v1/notifications", notifications);
app.use(ErrorMiddleware);

export default app;