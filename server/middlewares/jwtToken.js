import jwt from "jsonwebtoken";
import Users from "../models/user.js";
const secretKey = process.env.JWT_SECRET;

export const generateToken = async (userId, email, role) => {
  const userDetails = { userId, email, role,  };
  const token = jwt.sign(userDetails, secretKey, { expiresIn: "1d" });
  return token;
};

export const verifyToken = async (req, res, next) => {
  let token = req.headers.authorization;
    try {
      if (!token || !token.startsWith("Bearer "))
        return res
          .status(401)
          .json({ message: "Authentication failed: Please Login..." });
      token = token.split(" ")[1];
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      const user = await Users.findById(verified.userId)
      if(!user || user.isBlocked) return res
      .status(401)
      .json({ message: "User Blocked or User Not Found!" });
      req.user = verified
      next();

    } catch (error) {
      console.log(error);
      return res
        .status(401)
        .json({ message: "Authentication failed: invalid Login..." });
    }
};
