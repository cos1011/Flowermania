const nodemailer = require('nodemailer');

const sendEmail = async options => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    // console.log(process.env.EMAIL_PASSWORD,process.env.EMAIL_USERNAME, process.env.EMAIL.PORT, process.env.EMAIL_HOST)


    const mailOptions = {
        from: "Peter Song <peter-flo93@flowermania.io>",
        to: options.email,
        subject: options.subject,
        text: options.message
    };
 
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
