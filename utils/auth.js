import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

/**
 * @typedef {import("jsonwebtoken").JwtPayload & {
 *   userId: string,
 *   role: "admin" | "student" | "teacher"
 * }} DecodedToken
 */

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

export const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || "fallback-secret",
    { expiresIn: "7d" }
  );
};

/**
 * @param {string} token
 * @returns {DecodedToken | null}
 */
export const verifyToken = (token) => {
  try {
    return /** @type {DecodedToken} */ (
      jwt.verify(token, process.env.JWT_SECRET || "fallback-secret")
    );
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
};

/**
 * @param {Request} request
 * @returns {string|null}
 */
export const getTokenFromHeaders = (request) => {
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return null;
};
