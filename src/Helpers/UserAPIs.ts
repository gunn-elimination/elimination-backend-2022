import { User } from "../../types/DisadusTypes";
import phas from "password-hash-and-salt";
export const createUser = async (user: User) => {
  let existingUser = await MongoDB.db("UserData")
    .collection("users")
    .findOne({ userID: user.userID });
  if (existingUser) {
    return {
      success: false,
      message: "User already exists",
    };
  }
  existingUser = await MongoDB.db("UserData")
    .collection("users")
    .findOne({ email: user.email });
  if (existingUser) {
    return {
      success: false,
      message: "Email already exists",
    };
  }
  const newpass = await new Promise((res, rej) =>
    phas(user.password).hash((err, hash) => {
      if (err) rej(err);
      res(hash);
    })
  );
  await MongoDB.db("UserData")
    .collection("users")
    .insertOne({ ...user, password: newpass });
  return {
    success: true,
    message: "User created",
  };
};
export const getUserByEmail = (email: string) => {
  return MongoDB.db("UserData").collection("users").findOne({ email: email });
};
export const getUserByID = (userID: string) => {
  return MongoDB.db("UserData").collection("users").findOne({ userID: userID });
};
export const getUserByUsername = (username: string) => {
  return MongoDB.db("UserData")
    .collection("users")
    .findOne({ username: username });
};
