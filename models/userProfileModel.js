import mongoose from "mongoose";

const UserProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    require: true,
  },
  firstName: {
    type: String,
    require: true
  },
  lastName: {
    type: String,
    require: true
  },
  address: {
    type: String,
    require: true
  },
  phone: {
    type: Number,
    require: true
  },
})

export default userProfileModel = mongoose.model("UserProfiles", UserProfileSchema)