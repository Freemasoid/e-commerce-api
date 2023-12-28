import {
  getAllOrders,
  getSingleOrder,
  getCurrUserOrders,
  createOrder,
  updateOrder,
} from "../controllers/orderController.js";
import { authPermitMid, authUserMid } from "../middleware/authentication.js";
import express from "express";

const router = express.Router();

router
  .route("/")
  .get(authUserMid, authPermitMid("admin"), getAllOrders)
  .post(authUserMid, createOrder);

router.route("/showAllMyOrders").get(authUserMid, getCurrUserOrders);

router.route("/:id").get(authUserMid, getSingleOrder).patch(authUserMid, updateOrder);

export { router as orderRouter };
