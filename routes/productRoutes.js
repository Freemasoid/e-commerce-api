import {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
} from "../controllers/productController.js";
import { getSingleProductReviews } from "../controllers/reviewController.js";
import express from "express";
import { authUserMid, authPermitMid } from "../middleware/authentication.js";

const router = express.Router();

router
  .route("/")
  .post([authUserMid, authPermitMid("admin")], createProduct)
  .get(getAllProducts);

router.route("/uploadImage").post([authUserMid, authPermitMid("admin")], uploadImage);

router
  .route("/:id")
  .get(getSingleProduct)
  .patch([authUserMid, authPermitMid("admin")], updateProduct)
  .delete([authUserMid, authPermitMid("admin")], deleteProduct);

router.route("/:id/reviews").get(getSingleProductReviews);

export { router as prodRouter };
