const User = require("../Model/user");
const crypto = require("crypto");
function generateResetToken() {
  return crypto.randomBytes(20).toString("hex");
}

async function saveResetToken(email, otp) {
  try {
    const user = await User.findOne({ email });

    if (!user) { 
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }

}

async function sendResetPasswordOTP(email) {
  const otp = Math.floor(1000 + Math.random() * 9000);
  console.log(otp);

  const result = await sendResetPasswordEmail(email, otp);

  if (result.success) {
    const saved = await savenResetToken(email, otp);

    if (saved) {
      return { success: true, message: "OTP sent and saved successfully" };
    } else {
      return { success: false, message: "Failed to save OTP in the database" };
    }
  } else {
    return { success: false, message: "Error sending OTP via email" };
  }
}

(module.exports = { sendResetPasswordOTP }), { saveResetToken}  