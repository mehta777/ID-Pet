const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class mailUtill {
  async sendResetPasswordEmail(email, otp) {
    const mailOptions = {
      to: email,
      from: "kapil.devherds@gmail.com",
      subject: "Reset Your Password",
      text: `Your OTP is to reset your password is: ${otp}`,
    };

    try {
      await sgMail.send(mailOptions);
      return {
        success: true,
        message: "Email sent successfully",
      };
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }
}


module.exports = mailUtill; 