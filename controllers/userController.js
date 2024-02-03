import User from "../models/User.js";
import { StatusCodes } from "http-status-codes";
import {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
} from "../errors/custom-errors.js";
import createTokenUser from "../utils/createTokenUser.js";
import { attachCookiesToResponse } from "../utils/jwt.js";
import checkPermit from "../utils/checkPermit.js";

const getAllUsers = async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password");
  res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id }).select("-password");
  if (!user) {
    throw new NotFoundError(`No user with id: ${req.params.id}`);
  }
  checkPermit(req.user, user._id);
  res.status(StatusCodes.OK).json({
    user: {
      email: user.email,
      lastName: user.lastName,
      location: user.location,
      name: user.name,
      userId: user._id,
    },
  });
};

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

const updateUser = async (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) {
    throw new BadRequestError("Please provide all values");
  }
  const user = await User.findOne({ _id: req.user.userId });
  user.email = email;
  user.name = name;

  await user.save();

  const tokenUser = createTokenUser(user);

  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes).json({ user: tokenUser });
};

const updateUserPassword = async (req, res) => {
  const { oldPass, newPass } = req.body;

  if (!oldPass || !newPass) {
    throw new BadRequestError("Please provide current password and new password");
  }

  const user = await User.findOne({ _id: req.user.userId });
  const isPassOk = await user.checkPass(oldPass);

  if (!isPassOk) {
    throw new UnauthenticatedError("Invalid Credentials");
  }

  user.password = newPass;
  await user.save();
  res.status(StatusCodes.OK).json({ msg: "Success! Password Updated." });
};

export { getAllUsers, getSingleUser, showCurrentUser, updateUser, updateUserPassword };
