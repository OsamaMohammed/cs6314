import express from "express";
import {
    registerUser,
    listUsers,
    getUserById,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/", registerUser);
router.get("/list", listUsers);
router.get("/:id", getUserById);

export default router;
