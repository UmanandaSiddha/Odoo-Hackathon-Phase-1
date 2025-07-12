import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const accessTokenKey = process.env.ACCESS_TOKEN_SECRET_KEY;
const refreshTokenKey = process.env.REFRESH_TOKEN_SECRET_KEY;

// VALIDATING WHETHER ACCESS TOKEN AND REFRESH TOKEN ARE ACTUALLY PRESENT
if (!accessTokenKey || !refreshTokenKey) {
  throw new Error("Missing JWT secret keys in environment variables");
}

const accessTokenExpiryTime = process.env.ACCESS_GENERATE_TOKEN
  ? parseInt(process.env.ACCESS_GENERATE_TOKEN, 10)
  : 30 * 60; // DEFAULTS TO 30 MINUTES IN SECONDS
const refreshTokenExpiryTime = process.env.REFRESH_GENERATE_TOKEN
  ? parseInt(process.env.REFRESH_GENERATE_TOKEN, 10)
  : 14 * 24 * 60 * 60; // DEFAULTS TO 14 DAYS IN SECONDS

export const accessTokenGenerator = (userId: number) => {
  console.log("access token generated with the time as follows: ", accessTokenExpiryTime);
  const accessToken = jwt.sign({ userId: userId }, accessTokenKey, {
    expiresIn: accessTokenExpiryTime || "30m",
  });
  console.log("access token generated: ", accessToken);
  return accessToken;
};

export const refreshTokenGenerator = (userId: number) => {
  console.log("refresh token generated with the time as follows: ", refreshTokenExpiryTime);
  const refreshToken = jwt.sign({ userId: userId }, refreshTokenKey, {
    expiresIn: refreshTokenExpiryTime || "14d",
  });
  console.log("refresh token generated: ", refreshToken);
  return refreshToken;
};