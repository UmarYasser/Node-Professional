const nodemailer = require('nodemailer');
const dotenv = require('dotenv')
dotenv.config({path:'./../config.env'})

const sendEmail = async (option) =>{
    const transporter = nodemailer.createTransport({
        host:process.env.EMAIL_HOST,
        port:process.env.EMAIL_PORT,
        auth:{
            user:process.env.EMAIL_USER,
            pass:process.env.EMAIL_PASSWORD
        }
    });

    const emailOptions = {
        from: 'EgyBest support<egybestsupport@gmail.com>',
        to: option.email,
        subject: option.subject,
        text: option.message
    }

    transporter.sendMail(emailOptions)
    .then(info => {
      console.log('Email sent: ', info.response);
    })
    .catch(error => {
      console.error('Error sending email{SENDMAIL}: ', error);
    });
}

module.exports = {sendEmail}