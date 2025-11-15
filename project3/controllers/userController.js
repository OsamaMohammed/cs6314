import mongoose from "mongoose";
import User from "../schema/user.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

export const registerUser = async (req, res) => {
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
};

export const listUsers = async (_req, res) => {
    try {
        const users = await User.find({}, "_id first_name last_name").lean();
        return res.status(200).send(users);
    } catch (e) {
        return res.status(500).type("text/plain").send(e.toString());
    }
};

export const getUserById = async (req, res) => {
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
};
