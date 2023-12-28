import { UnauthenticatedError, UnauthorizedError } from "../errors/custom-errors.js";
import { isTokenValid } from "../utils/jwt.js";

const authUserMid = async (req, res, next) => {
  const token = req.signedCookies.token;

  if (!token) {
    throw new UnauthenticatedError("Authentication Invalid");
  }

  try {
    const { name, userId, role } = isTokenValid({ token });
    req.user = { name, userId, role };
    next();
  } catch (error) {
    throw new UnauthenticatedError("Authentication Invalid");
  }
};

const authPermitMid = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError("Unauthorized access");
    }
    next();
  };
};

export { authUserMid, authPermitMid };
