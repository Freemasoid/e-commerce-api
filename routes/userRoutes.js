import { authUserMid, authPermitMid } from "../middleware/authentication.js";
import {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} from "../controllers/userController.js";
import express from "express";

const router = express.Router();

router.route("/").get(authUserMid, authPermitMid("admin"), getAllUsers);
router.route("/showMe").get(authUserMid, showCurrentUser);
router.route("/updateUser").post(authUserMid, updateUser);
router.route("/updateUserPassword").post(authUserMid, updateUserPassword);
router.route("/:id").get(authUserMid, getSingleUser);

export { router as userRouter };
