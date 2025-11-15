import SchemaInfo from "../schema/schemaInfo.js";
import User from "../schema/user.js";
import Photo from "../schema/photo.js";

export const getInfo = async (_req, res) => {
    try {
        const info = await SchemaInfo.findOne({}).lean();
        return res.status(200).send(info || { load_date_time: "", loaded_from: "" });
    } catch (e) {
        return res.status(500).type("text/plain").send(e.toString());
    }
};

export const getCounts = async (_req, res) => {
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
};
