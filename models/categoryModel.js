import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,

  }
})

export default userProfileModel = mongoose.model("category", categorySchema)