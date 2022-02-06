import { User } from "../../types/DisadusTypes";

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
  await MongoDB.db("UserData").collection("users").insertOne(user);
  return {
    success: true,
    message: "User created",
  };
};
