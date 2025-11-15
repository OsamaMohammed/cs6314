import express from "express";
import { getInfo, getCounts } from "../controllers/testController.js";

const router = express.Router();

router.get("/info", getInfo);
router.get("/counts", getCounts);

export default router;
