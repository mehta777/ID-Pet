const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../../Jwt/jwtconfig");
const dog = require("../../Model/dogInfo");
const token = require("../../Jwt/harshJwt");
const sgMail = require("@sendgrid/mail");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const otpVerify = require("../../Model/otpVerify");
const mailUtill = require("../../Util/mail");
const sendMail = new mailUtill();
const User = require("../../Model/user");
const forgotPassword = require("../../Util/forgotPassword");
var fPassword = require("../../Model/otpVerify");
const ObjectId = require("mongoose").Types.ObjectId;
const Institute = require("../../Model/dogInstitute");
const express = require("express");
const user = require("../../Model/user");
function generateResetToken() {
  return crypto.randomBytes(20).toString("hex");
}

const { get } = require("mongoose");

const userController = {
  //   /////////////////////////////Create Account///////////////////////////////////

  async createUser(req, res) {
    try {
      const {
        email,
        password,
        ownerName,
        ownerSurname,
        whatsApp,
        contact,
        address,
      } = req.body;

      if (!email) {
        return res
          .status(400)
          .json({ success: false, message: "Please enter the email" });
      }

      if (!password) {
        return res
          .status(400)
          .json({ success: false, message: "Please enter the password" });
      }

      const data = await User.findOne({ email });

      if (data) {
        return res
          .status(500)
          .json({ success: false, message: "Email already exist" });
      }

      const hash = await bcrypt.hash(password, 10);

      const result = await User.create({
        email,
        password: hash,
        ownerName,
        ownerSurname,
        whatsApp,
        contact,
        address,
      });
      const token = jwt.sign({ Id: result._id }, config.JWT_SECRET);

      return res.status(200).json({
        success: true,
        message: "User Created Successfully",
        data: result,
        token: token,
      });
      return res.status(201).json({ token });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },

  /////////////////////////////// Login User ////////////////////////////////////////

  async loginUser(req, res) {
    try {
      const { email, password } = req.body;

      if (!email) {
        return res
          .status(400)
          .json({ success: false, message: "Please enter the email" });
      }

      if (!password) {
        return res
          .status(400)
          .json({ success: false, message: "Please enter the password" });
      }

      const user = await User.findOne({ email });

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      const hashed = await bcrypt.compare(password, user.password);

      if (!hashed) {
        return res
          .status(500)
          .json({ success: false, message: "Invalid Password" });
      }

      const token = jwt.sign({ Id: user._id }, config.JWT_SECRET);
      return res.status(200).json({
        success: true,
        message: "User Login Successfully",
        data: user,
        token: token,
      });
      return res.status(201).json({ token });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },
  //////////////////////////////////////// forGot Password /////////////////////////////////////

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res
          .status(400)
          .json({ success: false, message: "Please enter the email" });
      }
      console.log(email);

      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      var number = await Math.floor(1000 + Math.random() * 9000);

      // user.otp = number;
      // await user.save();
      var data = new fPassword(req.body);
      data.otp = number;
      await data.save();
      console.log(data);
      const result = await sendMail.sendResetPasswordEmail(email, number);
      if (!result.success) {
        return res
          .status(500)
          .json({ success: false, message: result.message });
      }

      return res.status(200).json({
        success: true,
        message: "Password reset otp sent successfully",
      });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },
  /////////////////////////////////////////reSendOtp///////////////////////////////////

  async reSendOtp(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res
          .status(400)
          .json({ success: false, message: "Please enter the email" });
      }

      let user = await otpVerify.findOne({ email });
      console.log(user);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      const otp = Math.floor(1000 + Math.random() * 9000);
      console.log(otp);
      var update = {
        otp: otp,
      };

      const reSend = await otpVerify.findByIdAndUpdate(user._id, update, {
        new: true,
      });
      const result = await sendMail.sendResetPasswordEmail(email, otp);
      if (!result.success) {
        return res
          .status(500)
          .json({ success: false, message: result.message });
      }
      return res.status(200).json({
        success: true,
        message: "OTP resend successfully",
      });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },

  ////////////////////////////////////////verificationOtp/////////////////////////////////////

  async verificationOtp(req, res) {
    try {
      const { email, otp } = req.body;
      if (!email)
        return res
          .status(400)
          .json({ success: false, message: "Please enter the email" });
      if (!otp) {
        return res
          .status(400)
          .json({ success: false, message: "Please enter the OTP" });
      }

      const user = await otpVerify.findOne({ email, otp });
      console.log("user", user);
      if (user) {
        await otpVerify.findByIdAndDelete(user._id);
        return res
          .status(200)
          .json({ success: true, message: "OTP Verify Successfully" });
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Incorrect OTP" });
      }
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },
  //////////////////////////////////////////createPassword//////////////////////////////////////

  async createPassword(req, res) {
    try {
      const { email, password } = req.body;

      if (!email) {
        return res
          .status(400)
          .json({ success: false, message: "Please enter the email" });
      }

      if (!password) {
        return res
          .status(400)
          .json({ success: false, message: "Please enter the paassword" });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      const hash = await bcrypt.hash(password, 10);
      user.password = hash;
      await user.save();
      return res
        .status(200)
        .json({ success: true, message: "Password updated successfully" });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },
  ///////////////////////////////////////userOtp/////////////////////////////////////
  async userOtp(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res
          .status(400)
          .json({ success: false, message: "Please enter the email" });
      }
      let user = await User.findOne({ email });
      // console.log(user)
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      const otp = Math.floor(1000 + Math.random() * 9000);
      console.log(otp);
      const update = { otp };
      const updateUser = await User.findByIdAndUpdate(user._id, update, {
        new: true,
      });
      const result = await sendMail.sendResetPasswordEmail(email, otp);
      if (!result.success) {
        return res
          .status(500)
          .json({ success: false, message: result.message });
      }
      return res.status(200).json({
        success: true,
        message: "OTP resent successfully",
      });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },
  //////////////////////////////////////////verifyUser/////////////////////////////////////
  async verifyUser(req, res) {
    try {
      const { email, otp } = req.body;
      if (!email) {
        return res
          .status(400)
          .json({ success: false, message: "Please enter the email" });
      }
      if (!otp) {
        return res
          .status(400)
          .json({ success: false, message: "Please enter the otp" });
      }
      const user = await User.findOne({ email });
      console.log("user", user);

      if (user && user.otp === otp) {
        await User.findByIdAndUpdate(user._id, { $unset: { otp: 1 } });
        return res
          .status(200)
          .json({ success: true, message: "OTP Verify Successfully" });
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Incorrect OTP" });
      }
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },
  //////////////////////////////////////////editProfile///////////////////////////////
  async editProfile(req, res) {
    try {
      const userId = req.params.userId;
      const { ownerName, ownerSurname, address, contact, whatsApp, email } =
        req.body;

      const updateFields = {
        ownerName,
        ownerSurname,
        address,
        contact,
        whatsApp,
        email,
      };

      const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
        new: true,
      });

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: updatedUser,
      });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },
  /////////////////////////////////////AddDogInfo///////////////////////////////////
  async dogInfo(req, res) {
    try {
      const { petName, petBreed, dateOfBirth, dogDescription } = req.body;

      const user = await User.findById(new ObjectId(req.user.Id));
      console.log("user", user);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      if (req.files && req.files.profileImage) {
        profileImage = "static/files/" + req.files.profileImage[0].filename;
      }
      if (req.files && req.files.bannerImage) {
        bannerImage = "static/files/" + req.files.bannerImage[0].filename;
      }

      const newDog = await dog.create({
        bannerImage,
        profileImage,
        petName,
        petBreed,
        dateOfBirth,
        dogDescription,
        userId: user._id,
      });

      return res.status(201).json({
        success: true,
        message: "Dog information added successfully",
        data: newDog,
      });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },
  /////////////////////////////////////////////deleteDog///////////////////////////////////////
  async deleteDog(req, res) {
    try {
      const dogId = req.params.dogId;
      const del = await dog.findByIdAndDelete(dogId);
      return res
        .status(200)
        .json({ success: true, message: "Dog Deleted Successfully" });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },
  /////////////////////////////////////updateDog////////////////////////////////////////////

  async updateDog(req, res) {
    try {
      const dogId = req.params.dogId;
      const { petName, petBreed, dateOfBirth, dogDescription } = req.body;

      const updateDog = await dog.findByIdAndUpdate(
        dogId,
        { petName, petBreed, dateOfBirth, dogDescription },
        { new: true }
      );

      if (!updateDog) {
        return res
          .status(404)
          .json({ success: false, message: "Dog not found" });
      }
      return res.status(200).json({
        success: true,
        message: "Dog updated successfully",
        data: updateDog,
      });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },
  //////////////////////////////////////////getInfo////////////////////////////////////
  async getInfo(req, res) {
    try {
      const dogId = req.params.dogId;

      const dogInfo = await dog.findOne({ _id: dogId });
      if (!dogInfo) {
        return res
          .status(404)
          .json({ success: false, message: "Dog not found" });
      }
      return res.status(200).json({
        success: true,
        message: "Dog information retrived successfully",
        data: dogInfo,
      });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },
  ////////////////////////////////////////deleteAllDog/////////////////////////////////////

  async deleteAllDog(req, res) {
    try {
      const userId = req.params.userId;
      await dog.deleteMany({ userId });
      return res
        .status(200)
        .json({ success: true, message: "All dogs deleted successfully" });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },

  /////////////////////////////////////////////////////userDogDetails/////////////////////////////////

  async userDogDetails(req, res) {
    try {
      const userId = req.user.Id;
      const userDetails = await User.aggregate([
        {
          $match: { _id: new ObjectId(userId) },
        },
        {
          $lookup: {
            from: "dogs",
            let: { userId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$userId", "$$userId"] },
                },
              },
            ],
            as: "dogs",
          },
        },
      ]);

      if (!userDetails[0]) {
        return res
          .status(404)
          .json({ success: false, message: "User dog not found" });
      }
      return res.status(200).json({
        success: true,
        message: "User dog details retrieved successfully",
        data: userDetails[0],
      });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },

  ////////////////////////////////////////////allUserDogDetails////////////////////////////////////////////
  async allUsersDogDetails(req, res) {
    try {
      const allUserDetails = await User.aggregate([
        {
          $lookup: {
            from: "dogs",
            let: { userId: "$_id" },
            pipeline: [
              {
                $match: { $expr: { $eq: ["$userId", "$$userId"] } },
              },
              {
                $lookup: {
                  from: "institutes",
                  let: { dogId: "$_id" },
                  pipeline: [
                    {
                      $match: { $expr: { $eq: ["$dogId", "$$dogId"] } },
                    },
                  ],
                  as: "dogInstitute",
                },
              },
            ],
            as: "dogs",
          },
        },
      ]);

      return res.status(200).json({
        success: true,
        message: "All users and their dog details retrieved successfully",
        data: allUserDetails,
      });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },

  /////////////////////////////////////////noOfDogs//////////////////////////////////////////////////

  async noOfDogs(req, res) {
    try {
      const dogsCount = await User.aggregate([
        {
          $lookup: {
            from: "dogs",
            localField: "_id",
            foreignField: "userId",
            as: "dogs",
          },
        },
        {
          $project: {
            _id: 1,
            username: 1,
            noOfDogs: { $size: "$dogs" },
          },
        },
      ]);

      return res.status(200).json({
        success: true,
        message: "Number of dogs per user retrieved successfully",
        data: dogsCount,
      });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },
  //////////////////////////////////////////dogInstitute///////////////////////////////
  async dogInstitute(req, res) {
    try {
      const { dogInstitute, dogId, address, contact } = req.body;

      const newDog = new Institute({
        dogInstitute,
        dogId,
        address,
        contact,
      });
      const saveDog = await newDog.save();
      return res.status(201).json({
        success: true,
        message: "Dog details added successfully",
        data: saveDog,
      });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },
  ////////////////////////////////////////////ownerDetails/////////////////////////

  async ownerDetails(req, res) {
    try {
      const allUserDetails = await User.aggregate([
        {
          $lookup: {
            from: "dogs",
            let: { userId: "$_id" },
            pipeline: [
              {
                $match: { $expr: { $eq: ["$userId", "$$userId"] } },
              },
              {
                $lookup: {
                  from: "institutes",
                  let: { dogId: "$_id" },
                  pipeline: [
                    {
                      $match: { $expr: { $eq: ["$dogId", "$$dogId"] } },
                    },
                  ],
                  as: "dogInstitute",
                },
              },
            ],
            as: "dogs",
          },
        },
        {
          $unwind: { path: "$dogs", preserveNullAndEmptyArrays: true },
        },
        {
          $project: {
            _id: 1,
            ownerName: 1,
            ownerSurname: 1,
            instituteName: {
              $arrayElemAt: ["$dogs.dogInstitute.dogInstitute", 0],
            },
          },
        },
      ]);

      return res.status(200).json({
        success: true,
        message: "Owner details retrieved successfully",
        data: allUserDetails,
      });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },
  ////////////////////////////////////////UserDetails////////////////////////////////

  async userDetails(req, res) {
    try {
      const userId = req.params.userId;

      const result = await User.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(userId) },
        },
        { $project: { ownerName: 1, ownerSurname: 1, address: 1 } },
        {
          $lookup: {
            from: "dogs",
            let: { userId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$userId", "$$userId"] },
                },
              },
              {
                $sort: { _id: -1 },
              },
              {
                $limit: 1,
              },
              {
                $lookup: {
                  from: "institutes",
                  let: { dogId: "$_id" },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ["$dogId", "$$dogId"] },
                      },
                    },
                  ],
                  as: "institute",
                },
              },
              {
                $project: {
                  bannerImage: 1,
                  profileImage: 1,
                  petName: 1,
                  gender: 1,
                  institute: 1,
                },
              },
            ],
            as: "dog",
          },
        },
      ]);

      if (result.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "All details retrieved successfully",
        data: result[0],
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  },
};

module.exports = userController;
