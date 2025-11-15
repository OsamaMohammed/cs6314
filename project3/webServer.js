import mongoose from "mongoose";
import bluebird from "bluebird";
import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import { addComment, getPhotosOfUser, upload, uploadPhoto } from "./controllers/photoController.js";

const app = express();
const portno = 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  return next();
});

app.use(bodyParser.json());
app.use(
  session({
    secret: "photoapp",
    resave: false,
    saveUninitialized: false,
  })
);

mongoose.Promise = bluebird;
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project3", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use((req, res, next) => {
  if (
    req.path === "/user" ||
    req.path === "/admin/login" ||
    req.path === "/admin/logout" ||
    req.path.startsWith("/test")
  ) {
    return next();
  }

  if (!req.session.user_id) {
    return res.status(401).send("Unauthorized.");
  }

  return next();

});

app.get("/", (_req, res) => {
  res.send("Simple web server of files from " + __dirname);
});

// --- ROUTES ---
app.use("/admin", adminRoutes);
app.use("/user", userRoutes);
app.use("/test", testRoutes);

app.get("/photosOfUser/:id", getPhotosOfUser);
app.post("/photos/new", upload.single("uploadedphoto"), uploadPhoto);
app.post("/commentsOfPhoto/:photo_id", addComment);

// --- STATIC FILES ---
app.use(express.static(__dirname));
app.use("/images", express.static(join(__dirname, "images")));

// --- 404 HANDLER ---
app.use((_req, res) => {
  res.status(404).type("text/plain").end("Not Found");
});

// --- ERROR HANDLER ---
app.use((err, _req, res) => {
  console.error(err);
  res.status(500).type("text/plain").end(err?.toString?.() || "Internal Server Error");
});

const server = app.listen(portno, () => {
  const port = server.address().port;
  console.log(`Listening at http://localhost:${port} exporting ${__dirname}`);
});
