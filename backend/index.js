import express from "express";
import cors from "cors";
import { prompt } from "./models/prompt.models.js";
import connectDB from "./database.js";
import { User } from "./models/login.models.js";
import { sign } from "./models/signup.models.js";
import fs from "fs";
import multer from "multer";
import os from "os";
import path from "path";
import bcrypt from "bcrypt";
import { HistoryModel } from "./models/history.models.js";
import generateOtp from "./generateOTP.js";
import "dotenv/config";
import nodemailer from "nodemailer";

const app = express();
const PORT = 6969;
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5000"],
    methods: ["POST", "GET", "PUT"],
    credentials: true,
  })
);
const jason = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.PASS_USER,
  },
});
const upload = multer({ dest: "temp/" });
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log(`MongoDB connection failed:${error}`);
  });

app.post("/login", async (req, res) => {
  const { emailId, HashPw } = req.body;

  try {
    const user = await User.findOne({ email: emailId });
    console.log(user);
    if (!user) {
      console.log(user);
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(HashPw, user.password);
    if (!isPasswordValid) {
      console.log(isPasswordValid);
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }
    if (emailId === "admin@gmail.com" && HashPw === "iamadmin") {
      return res
        .status(200)
        .json({ success: true, message: "admin", userid: user._id });
    }
    res.status(200).json({
      success: true,
      message: "Login successful",
      userid: user._id,
      user,
    });
  } catch (error) {
    console.error(`Error during login: ${error.message}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/signup", async (req, res) => {
  const { fname, lname, emailId, pno, gen, HashPw } = req.body;

  try {
    const existingUser = await User.findOne({ email: emailId });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }
    const newSign = new sign({
      firstname: fname,
      lastname: lname,
      email: emailId,
      phoneno: pno,
      gender: gen,
      password: HashPw,
    });
    const signsaved = await newSign.save();
    const newUser = new User({
      email: emailId,
      password: HashPw,
    });

    const saved = await newUser.save();
    res
      .status(201)
      .json({ success: true, message: "Signup successful", user: newUser });
  } catch (error) {
    console.error(`Error during signup: ${error.message}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/files", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const dirdownload = path.join(os.homedir(), "Downloads");
    const targetPath = path.join(
      dirdownload,
      `${Date.now()}-${file.originalname}`
    );
    console.log(`File uploaded to: ${targetPath}`);

    fs.renameSync(file.path, targetPath);
    res
      .status(200)
      .json({ message: "File uploaded successfully", path: targetPath });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(500).json({ error: "Something went wrong" });
  }
});
app.post("/rag", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    console.log(req.file);
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const dirdownload = path.join(os.homedir(), "Downloads");
    const targetPath = path.join(
      dirdownload,
      `${Date.now()}-${file.originalname}`
    );
    // const targetPath = "C:\Users\spent\Downloads";

    fs.renameSync(file.path, targetPath);
    res
      .status(200)
      .json({ message: "File uploaded successfully", path: targetPath });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// voice rag

app.post("/voicerag", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    console.log(req.file);
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const dirdownload = path.join(os.homedir(), "Downloads");
    const targetPath = path.join(
      dirdownload,
      `${Date.now()}-${file.originalname}`
    );
    // const targetPath = "C:\Users\spent\Downloads";

    fs.renameSync(file.path, targetPath);
    res
      .status(200)
      .json({ message: "File uploaded successfully", path: targetPath });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(500).json({ error: "Something went wrong" });
  }
});
app.put("/storeHistory/:userid", async (req, res) => {
  try {
    const userid = req.params.userid;
    const { history } = req.body;
    const checkIt = await HistoryModel.findOneAndUpdate(
      {
        userId: userid,
      },
      { historyRes: history },
      { upsert: true, new: true }
    );
    console.log(`updated the model ${checkIt.historyRes}`);
    res.status(200).json({ message: "saved it " });
  } catch (error) {
    console.log(`error in seting the history ${error}`);
  }
});
app.get("/getHistory/:userId", async (req, res) => {
  try {
    const userid = req.params.userId;
    const findUser = await HistoryModel.findOne({ userId: userid });
    if (findUser) {
      console.log(findUser.historyRes);
      res.status(200).json({ message: findUser.historyRes });
    } else {
      const newList = [];
      const newHistory = new HistoryModel({
        userId: userid,
        historyRes: newList,
      });
      await newHistory.save();
    }
  } catch (error) {
    console.log(`error in seting the history ${error}`);
  }
});

app.get("/getName/:email", async (req, res) => {
  try {
    const Email = req.params.email;
    const user = await sign.findOne({ email: Email });
    console.log(user);
    res.status(200).send({ data: user.firstname });
  } catch (error) {
    res.status(500).send({ error: error });
  }
});

app.get("/getOtp/:userId/:email", async (req, res) => {
  try {
    const userId = req.params.userId;
    const email = req.params.email;
    const existinguser = await User.findOne({ _id: userId });
    console.log(existinguser);
    if (existinguser.email === email) {
      const otp = generateOtp();
      const mailoptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "SEEKHAN ASKS YOU IF YOU NEED A CHANGE IN PASSWORD",
        text: `if so please use this as the conformation code ${otp}`,
      };
      await jason.sendMail(mailoptions);
      console.log(`Verification code sent to ${email}: ${otp}`);
      res.status(200).send({ data: otp });
    } else {
      res.status(400).send({ data: "This email is not recognized as user" });
    }
  } catch (error) {
    res.status(500).send({ error: error });
  }
});

app.put("/setPassword/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const newPassword = req.body.password; // Ensure "password" is sent from frontend

    if (!newPassword) {
      return res.status(400).json({ error: "Password is required" });
    }

    // Hash the password manually since `findByIdAndUpdate` does not trigger pre-save hooks
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ error: `Password update failed: ${error.message}` });
  }
});
