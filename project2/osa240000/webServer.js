/**
 * Project 2 Express server connected to MongoDB 'project2'.
 * Start with: node webServer.js
 * Client uses axios to call these endpoints.
 */

// eslint-disable-next-line import/no-extraneous-dependencies
import mongoose from "mongoose";
// eslint-disable-next-line import/no-extraneous-dependencies
import bluebird from "bluebird";
import express from "express";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load the Mongoose schema for User, Photo, and SchemaInfo
// ToDO - Your submission will use code below, so make sure to uncomment this line for tests and before submission!
import User from "./schema/user.js";
import Photo from "./schema/photo.js";
import SchemaInfo from "./schema/schemaInfo.js";

const portno = 3001; // Port number to use
const app = express();

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

mongoose.Promise = bluebird;
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project2", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));

app.get("/", function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

/**
 * /test/info - Returns the SchemaInfo object of the database in JSON format.
 *              This is good for testing connectivity with MongoDB.
 */

app.get('/test/info', async (request, response) => {
  const info = await SchemaInfo.find();
  response.status(200).send(info);
});

/**
 * /test/counts - Returns an object with the counts of the different collections
 *                in JSON format.
 */
app.get('/test/counts', async (request, response) => {
  const users = await User.find();
  const photoCount = await Photo.countDocuments();

  response.status(200).send({
    user: users.length,
    photo: photoCount,
    schemaInfo: 1
  });
});

/**
 * URL /user/list - Returns all the User objects.
 */
app.get('/user/list', async (request, response) => {
  const users = await User.find().lean();

  // 1. Create an array of promises. Each promise in this array
  //    will resolve to the fully populated user object.
  const userPromises = users.map(async (user) => {
    // Start both queries in parallel
    const photoCountPromise = Photo.countDocuments({ user_id: user._id });
    const photosWithCommentsPromise = Photo.find({ 'comments.user_id': user._id }).lean();

    // Wait for both to finish
    const [photoCount, photos] = await Promise.all([
      photoCountPromise,
      photosWithCommentsPromise
    ]);

    // Calculate comment count in JS
    let commentCount = 0;
    for (const photo of photos) {
      commentCount += photo.comments.filter(comment => comment.user_id.equals(user._id)).length;
    }

    // Return the final user object with new properties
    return {
      ...user,
      photoCount: photoCount,
      commentCount: commentCount
    };
  });

  // 2. Wait for all the user-modification promises to complete
  const usersWithCounts = await Promise.all(userPromises);

  response.status(200).send(usersWithCounts);
});
/**
 * URL /user/:id - Returns the information for User (id).
 */
app.get('/user/:id', async (request, response) => {
  // Validate id
  if (!request.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    response.status(400).send({ err: "Invalid ID" });
    return;
  }
  const user = await User.findById(request.params.id);
  if (!user) {
    response.status(400).send({ err: "Not found" });
    return;
  }
  response.status(200).send(user);
});

/**
 * URL /photosOfUser/:id - Returns the Photos for User (id).
 */
app.get('/photosOfUser/:id', async (request, response) => {
  // Validate id
  if (!request.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return response.status(400).send({ err: "Invalid ID" });
  }

  const photoDocs = await Photo.find({ user_id: request.params.id });
  if (!photoDocs || photoDocs.length === 0) {
    return response.status(404).send({ error: 'Photos not found' });
  }

  const photos = photoDocs.map(doc => doc.toJSON());

  // 1. Collect all unique user_id's from all comments
  const userIdSet = new Set();
  for (const photo of photos) {
    for (const comment of photo.comments) {
      userIdSet.add(comment.user_id.toString());
    }
  }
  const userIds = Array.from(userIdSet);

  // 2. Fetch all users in ONE query
  const users = await User.find({ _id: { $in: userIds } }).lean();

  // 3. Create a fast lookup map (e.g., { 'userId123': { user_data... } })
  const userMap = new Map(users.map(user => [user._id.toString(), user]));

  // 4. Stitch the data together (this is all in-memory and very fast)
  for (const photo of photos) {
    for (const comment of photo.comments) {
      const user = userMap.get(comment.user_id.toString());
      if (user) {
        comment.user = {
          _id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
        };
      }
      delete comment.user_id;
    }
  }

  return response.status(200).send(photos);
});

/**
 * URL /commentsOfUser/:id - Returns the comments for User (id).
 */
app.get('/commentsOfUser/:id', async (request, response) => {
  // Validate id
  if (!request.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    response.status(400).send({ err: "Invalid ID" });
    return;
  }
  // Find all photos if the user has commented on
  const user = await User.findById(request.params.id);
  if (!user) {
    response.status(404).send({ error: 'User not found' });
    return;
  }
  const photoDocs = await Photo.find({ 'comments.user_id': user._id });
  const photos = photoDocs.map(doc => doc.toJSON());

  // filter only user's comments
  for (const photo of photos) {
    photo.comments = photo.comments.filter(comment => comment.user_id.equals(user._id));
  }
  response.status(200).send(photos);
});

const server = app.listen(portno, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
    port +
    " exporting the directory " +
    __dirname
  );
});
