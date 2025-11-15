import mongoose from "mongoose";
import multer from "multer";
import User from "../schema/user.js";
import Photo from "../schema/photo.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getPhotosOfUser = async (req, res) => {
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
};

export const addComment = async (req, res) => {
    const { photo_id } = req.params;
    const { comment } = req.body;

    if (!isValidId(photo_id)) {
        return res.status(400).send("Invalid photo_id");
    }

    if (!comment || comment.trim().length === 0) {
        return res.status(400).send("Comment cannot be empty");
    }

    try {
        const photo = await Photo.findById(photo_id);
        if (!photo) {
            return res.status(400).send("Photo not found");
        }

        const newComment = {
            comment: comment.trim(),
            user_id: req.session.user_id,
            date_time: new Date(),
        };

        photo.comments.push(newComment);
        await photo.save();

        return res.status(200).send({ newComment });
    } catch (e) {
        console.error("Error adding comment:", e);
        return res.status(500).type("text/plain").send(e.toString());
    }
};

// --- MULTER CONFIGURATION ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "images/");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

export const upload = multer({ storage });

export const uploadPhoto = async (req, res) => {
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
};
