import { Router } from "express";
import { getUsers } from "../controllers/devController.js";
import devVerify from "../middleware/dev.js";

const router = Router();

router.post("/getUsers", devVerify, getUsers);

export default router;
