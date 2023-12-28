import { UnauthorizedError } from "../errors/custom-errors.js";

const checkPermit = (reqUser, rssUserId) => {
  if (reqUser.role === "admin") return;
  if (reqUser.userId === rssUserId.toString()) return;
  throw new UnauthorizedError("You have no authorization here!");
};

export default checkPermit;
