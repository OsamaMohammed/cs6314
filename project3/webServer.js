import mongoose from "mongoose";
import bluebird from "bluebird";
import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

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

mongoose.Promise = bluebird;
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project3", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

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