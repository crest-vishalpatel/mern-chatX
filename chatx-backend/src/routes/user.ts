import express, { Request, Response } from "express";
import {
  getAllUsers,
  getUsers,
  login,
  logout,
  register,
} from "../controllers/user";
import verifyToken from "../middlewares/auth";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verify", verifyToken, (req: Request, res: Response) => {
  res.status(200).send({ userId: req.userId });
});
router.get("/", verifyToken, getUsers);
router.get("/all", verifyToken, getAllUsers);
router.post("/logout", logout);

export default router;
