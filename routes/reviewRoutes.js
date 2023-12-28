import {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";
import { authUserMid } from "../middleware/authentication.js";
import express from "express";

const router = express.Router();

router.route("/").get(getAllReviews).post(authUserMid, createReview);

router
  .route("/:id")
  .get(getSingleReview)
  .patch(authUserMid, updateReview)
  .delete(authUserMid, deleteReview);

export { router as reviewRouter };
