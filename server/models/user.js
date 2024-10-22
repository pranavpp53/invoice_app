import mongoose from "mongoose";
const {ObjectId}=mongoose.Schema

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  phoneNo: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  userRole: {
    type: ObjectId,
    ref:"Role"
  },
  lastLoggedIn: {
    type: Date,
    default: null,
  },
  isBlocked:{
    type:Boolean,
    default:false
  }
});

const Users = mongoose.model("Users", userSchema);

export default Users;
