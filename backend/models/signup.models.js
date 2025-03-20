import mongoose from "mongoose";
import bcrypt from "bcrypt";
const signSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      trim: true,
      required: true,
    },
    lastname: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      required: true,
      lowercase: true,
      trim: true,
      type: String,
      index: true,
      unique: true,
    },
    phoneno: {
      type: Number,
      required: true,
    },
    gender: {
      required: true,
      type: String,
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
  },
  {
    timestamps: true,
  }
);
signSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});
signSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};
export const sign = mongoose.model("sign", signSchema);
