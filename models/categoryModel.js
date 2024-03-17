import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
  },

  slug: {
    type: String,

  },
  slug: {
    type: String,

  }
})


const category = mongoose.model("category", categorySchema)

export default category
