const Brevo = require('@getbrevo/brevo');
const crypto = require('crypto');
const redisClient = require('../database/redisConnection');

async function sendEmail(userData) {
  try {
    const secret = crypto.randomBytes(3).toString('hex');
    console.log('Generated OTP:', secret);

    const apiInstance = new Brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(
      Brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    );

    const sendSmtpEmail = {
      to: [{ email: userData.email }],
      sender: { email: "jagdishgithub1@gmail.com", name: "Jagdish Pathakji" }, // ✅ fixed here
      subject: 'OTP for verification',
      htmlContent: `<h1>Your OTP is: ${secret}</h1><p>Expires in 5 minutes.</p>`,
    };

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Email sent successfully to', userData.email);

    const { username, email, password } = userData;
    await redisClient.set(`otp:${email}`, secret, { EX: 300 });
    await redisClient.set(
      `user:${email}`,
      JSON.stringify({ username, email, password }),
      { EX: 300 }
    );
    return true;
  } catch (err) {
    console.error('Error sending email:', err.response?.body || err.message);
    return false;
  }
}

module.exports = sendEmail;