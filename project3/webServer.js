import mongoose from "mongoose";
import bluebird from "bluebird";
import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import multer from "multer";

import User from "./schema/user.js";
import Photo from "./schema/photo.js";
import SchemaInfo from "./schema/schemaInfo.js";

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

app.use(bodyParser.json()); // <-- Parse JSON request bodies

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

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// --- LOGIN ROUTE ---
app.post("/admin/login", async (req, res) => {
  const { login_name, password } = req.body;

  if (!login_name || !password) {
    return res.status(400).send("Missing login_name or password");
  }

  try {
    const user = await User.findOne({ login_name });
    if (!user) {
      return res.status(400).send("Invalid login_name");
    }

    if (user.password !== password) {
      return res.status(400).send("Incorrect password");
    }

    // Store user info in session
    req.session.user_id = user._id;
    req.session.login_name = user.login_name;

    // Return only necessary user info
    return res.status(200).send({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      login_name: user.login_name,
    });
  } catch (e) {
    return res.status(500).type("text/plain").send(e.toString());
  }
});

app.post("/admin/logout", (req, res) => {
  if (!req.session.user_id) {
    return res.status(400).send("No session");
  }

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Error logging out");
    }
    return res.status(200).send("Logout successful");
  });
  return res.status(200).send("Logout successful");
});

// All routes below this require a logged-in user
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

app.get("/test/info", async (_req, res) => {
  try {
    const info = await SchemaInfo.findOne({}).lean();
    return res.status(200).send(info || { load_date_time: "", loaded_from: "" });
  } catch (e) {
    return res.status(500).type("text/plain").send(e.toString());
  }
});

app.get("/test/counts", async (_req, res) => {
  try {
    const [user, photo, schemaInfo] = await Promise.all([
      User.countDocuments({}),
      Photo.countDocuments({}),
      SchemaInfo.countDocuments({}),
    ]);
    return res.status(200).send({ user, photo, schemaInfo });
  } catch (e) {
    return res.status(500).type("text/plain").send(e.toString());
  }
});

app.post("/user", async (req, res) => {
  const {
    login_name,
    password,
    first_name,
    last_name,
    location,
    description,
    occupation,
  } = req.body;

  if (!login_name || !password || !first_name || !last_name) {
    return res
      .status(400)
      .send("login_name, password, first_name, and last_name are required.");
  }

  try {
    const existingUser = await User.findOne({ login_name });
    if (existingUser) {
      return res.status(400).send("That login_name is already taken.");
    }

    const newUser = new User({
      login_name,
      password,
      first_name,
      last_name,
      location: location || "",
      description: description || "",
      occupation: occupation || "",
    });

    await newUser.save();

    return res.status(200).send({
      _id: newUser._id,
      login_name: newUser.login_name,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
    });
  } catch (e) {
    console.error("Error registering user:", e);
    return res.status(500).type("text/plain").send(e.toString());
  }
});


app.get("/user/list", async (_req, res) => {
  try {
    const users = await User.find({}, "_id first_name last_name").lean();
    return res.status(200).send(users);
  } catch (e) {
    return res.status(500).type("text/plain").send(e.toString());
  }
});

app.get("/user/:id", async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).end();
  }

  try {
    const u = await User.findById(
      id,
      "_id first_name last_name location description occupation"
    ).lean();

    if (!u) {
      return res.status(400).end();
    }
    return res.status(200).send(u);
  } catch (e) {
    return res.status(500).type("text/plain").send(e.toString());
  }
});

app.get("/photosOfUser/:id", async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).end();
  }

  try {
    const user = await User.findById(id, "_id").lean();
    if (!user) {
      return res.status(400).end();
    }

    const photos = await Photo.find(
      { user_id: id },
      "_id user_id file_name date_time comments"
    ).lean();

    const commenterIds = new Set();
    photos.forEach((p) => {
      (p.comments || []).forEach((c) => commenterIds.add(String(c.user_id)));
    });

    let commenters = [];
    if (commenterIds.size) {
      commenters = await User.find(
        { _id: { $in: Array.from(commenterIds) } },
        "_id first_name last_name"
      ).lean();
    }

    const userById = new Map(commenters.map((u) => [String(u._id), u]));

    const apiPhotos = photos.map((p) => ({
      _id: p._id,
      user_id: p.user_id,
      file_name: p.file_name,
      date_time: p.date_time,
      comments: (p.comments || []).map((c) => ({
        _id: c._id,
        comment: c.comment,
        date_time: c.date_time,
        user:
          userById.get(String(c.user_id)) ||
          { _id: c.user_id, first_name: "", last_name: "" },
      })),
    }));

    return res.status(200).send(apiPhotos);
  } catch (e) {
    return res.status(500).type("text/plain").send(e.toString());
  }

});

// --- ADD COMMENT TO PHOTO ROUTE ---
app.post("/commentsOfPhoto/:photo_id", async (req, res) => {
  const { photo_id } = req.params;
  const { comment } = req.body;

  // Validate photo_id
  if (!isValidId(photo_id)) {
    return res.status(400).send("Invalid photo_id");
  }

  // Validate comment text
  if (!comment || comment.trim().length === 0) {
    return res.status(400).send("Comment cannot be empty");
  }

  try {
    // Find the photo
    const photo = await Photo.findById(photo_id);
    if (!photo) {
      return res.status(400).send("Photo not found");
    }

    // Create new comment object
    const newComment = {
      comment: comment.trim(),
      user_id: req.session.user_id,
      date_time: new Date(),
    };

    // Add comment to photo
    photo.comments.push(newComment);
    await photo.save();

    return res.status(200).send({ newComment });
  } catch (e) {
    console.error("Error adding comment:", e);
    return res.status(500).type("text/plain").send(e.toString());
  }
});

// --- MULTER CONFIGURATION ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images/");
  },
  filename: function (req, file, cb) {
    // const ext = path.extname(file.originalname);
    // // get epoch timestamp
    // const timestamp = Date.now();
    // // generate a unique name with timestamp and extension
    // const uniqueName = timestamp + "-" + randomInt(1000) + ext;
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.post("/photos/new", upload.single("uploadedphoto"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    const newPhoto = new Photo({
      file_name: req.file.filename,
      date_time: new Date(),
      user_id: req.session.user_id,
      comments: [],
    });

    await newPhoto.save();

    return res.status(200).send(newPhoto);
  } catch (err) {
    console.error("Error uploading photo:", err);
    return res.status(500).type("text/plain").send(err.toString());
  }
});

app.use(express.static(__dirname));
app.use("/images", express.static(join(__dirname, "images")));

app.use((_req, res) => {
  res.status(404).type("text/plain").end("Not Found");
});

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).type("text/plain").end(err?.toString?.() || "Internal Server Error");
});

const server = app.listen(portno, () => {
  const port = server.address().port;
  console.log(`Listening at http://localhost:${port} exporting ${__dirname}`);
});
