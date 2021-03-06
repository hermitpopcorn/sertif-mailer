const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
);
oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN
});

module.exports = {
    send: (session, filename, address, name) => {
        return new Promise((resolve, reject) => {
            var accessToken = oauth2Client.getAccessToken()
            accessToken.then(response => {
                const smtpTransport = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        type: "OAuth2",
                        user: process.env.SENDER_EMAIL,
                        clientId: process.env.CLIENT_ID,
                        clientSecret: process.env.CLIENT_SECRET,
                        refreshToken: process.env.REFRESH_TOKEN,
                        accessToken: response.token,
                    }
                });

                const mailOptions = {
                    from: {
                        name: process.env.SENDER_NAME,
                        address: process.env.SENDER_EMAIL
                    },
                    to: {
                        name: name,
                        address: "dani.hmng@gmail.com"
                    },
                    subject: "Automated Mail Test (" + address + ")",
                    generateTextFromHTML: true,
                    html: new Date().toLocaleString(),
                    attachments: [
                        {
                            filename: "Sertifikat " + name + '.pdf',
                            path: 'save/' + session + '/' + filename + '.pdf'
                        }
                    ]
                };

                resolve(mailOptions); return;
                smtpTransport.sendMail(mailOptions, (err, response) => {
                    if (err) reject(err);
                    smtpTransport.close();
                    resolve(response);
                });
            });
        });
    }
};
