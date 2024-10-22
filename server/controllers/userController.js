import Users from "../models/user.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../middlewares/jwtToken.js";
import Role from "../models/role.js";

//login user
export const loginUser = async (req, res) => {
  const { userId, password } = req.body;  
  const user = await Users.findOne({ userId });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  if (!(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: "Invalid password" });
  }

  if(user.isBlocked){
    return res.status(401).json({ message: "User Blocked" });
  }

  await Users.findOneAndUpdate(
    { userId },
    { lastLoggedIn: new Date() },
    { new: true }
  );

  const role = await Role.findOne({ _id: user.userRole });
  const roleName = role.roleName;
  const permissions = role.permissions;

  const token = await generateToken(user._id, user.email, user.userRole);

  return res.status(200).json({
    message: "Login successful",
    token: token,
    user: {
      userName: user.userName,
      email:user.email,
      lastLoggedIn: user.lastLoggedIn,
      roleName: roleName,
      permissions: permissions,
    },
  });
};

//add user
export const signupUser = async (req, res) => {
  const userDetails = req.body;
  const existingUser = await Users.findOne({ userId: userDetails.userId });
  if (existingUser) {
    return res
      .status(400)
      .json({ error: "User with same userId already exists" });
  }
  userDetails.password = await bcrypt.hash(userDetails.password, 10);
  const newUser = new Users(userDetails);
  await newUser.save();
  res.status(201).json({ message: "New user created successfully", newUser });
};

//get filtered sub users
export const getFilteredSubUsers = async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;
  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);

  let query = { 
    userId: { $ne: "admin" },  // Exclude admin users
    userRole: { $ne: "66f4f8ee37fecad218d9fc69" }  // Exclude users with this roleId
  };

  if (search) {
    query.$and = [
      { $or: [
        { userId: { $regex: search, $options: "i" } },
        { userName: { $regex: search, $options: "i" } },
      ]},
    ];
  }

  const total = await Users.countDocuments(query);
  const totalPages = Math.ceil(total / limitNumber);

  const subUsers = await Users.find(query)
    .skip((pageNumber - 1) * limitNumber)
    .limit(limitNumber);

  if (subUsers.length === 0) {
    return res.status(404).json({ message: "No subUsers found" });
  }

  const sanitizedSubUsers = subUsers.map((user) => {
    const userObject = user.toObject();
    delete userObject.password;
    return userObject;
  });

  res.status(200).json({
    message: "SubUsers retrieved successfully",
    subUsers: sanitizedSubUsers,
    currentPage: pageNumber,
    totalPages: totalPages,
    totalItems: total,
  });
};

//get all sub users
export const getAllSubUsers = async (req, res) => {
  const subUsers = await Users.find();
  return res.status(200).json(subUsers);
};

//edit sub users
export const editSubUser = async (req, res) => {
  const { id } = req.params;
  const { userName, userId, phoneNo, email, userRole, password } = req.body;

  const user = await Users.findById(id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  if (userId !== user.userId) {
    const userWithSameUserId = await Users.findOne({ userId });
    if (userWithSameUserId) {
      return res
        .status(400)
        .json({ error: "A user with same userId already exists" });
    }
  }

  user.userId = userId || user.userId;
  user.userName = userName || user.userName;
  user.phoneNo = phoneNo || user.phoneNo;
  user.email = email || user.email;
  user.userRole = userRole || user.userRole;

  if (password) {
    user.password = await bcrypt.hash(password, 10);
  }

  await user.save();

  const userObject = user.toObject();
  delete userObject.password;

  return res.status(200).json({
    message: "subUser updated successfully",
    user: userObject,
  });
};

// delete sub user
export const deleteSubUser = async (req, res) => {
  const { id } = req.params;

  const user = await Users.findById(id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  await Users.findByIdAndDelete(id);

  return res.status(200).json({
    message: "subUser deleted successfully",
  });
};

//change password
export const updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.userId;

  const user = await Users.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Old password is incorrect" });
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();
  return res.status(200).json({ message: "Password updated successfully" });
};

export const getUserStatus = async (req, res) => {
  const { id } = req.params;
  const user = await Users.findOne({ _id: id }).populate("userRole");
  if (user) {
    res.status(200).send({
      success: true,
      message: "User Find Success",
      user,
    });
  } else {
    res.status(403).send({
      success: false,
      message: "Invalid User",
    });
  }
};

export const checkAndUnblockUser = async (req, res) => {
  const { id } = req.params;
  const user = await Users.findById(id);

  if (!user) {
    return res.status(404).send({
      message: "User not found",
    });
  }

  if (user.isBlocked) {
    user.isBlocked = false;
    await user.save();
    return res.status(200).send({
      message: "User has been unblocked",
    });
  } else {
    user.isBlocked = true;
    await user.save();
    return res.status(200).send({
      message: "User is blocked",
    });
  }
};
