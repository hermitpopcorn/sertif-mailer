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

var SESSIONS = ['d25sesi1', 'd25sesi2', 'd26sesi1', 'd26sesi2', 'd27sesi1', 'd27sesi2'];

var SUBJECTS = {
    'd25sesi1': "[WEBINAR SERIES] E-Sertifikat dan Materi Webinar Launching dan Bedah Buku Etika Berbahasa Jepang dalam Dunia Kerja",
    'd25sesi2': "[WEBINAR SERIES] E-Sertifikat dan Materi Webinar Kemahiran Berbahasa Jepang",
    'd26sesi1': "[WEBINAR SERIES] E-Sertifikat dan Materi Webinar Bencana dari Sudut Pandang Diplomasi dan Kesusastraan Jepang",
    'd26sesi2': "[WEBINAR SERIES] E-Sertifikat dan Materi Webinar Nihon Dentou no Bi (Keindahan Tradisional Jepang)",
    'd27sesi1': "[WEBINAR SERIES] E-Sertifikat dan Materi Webinar Seluk-Beluk Linguistik Bahasa Jepang",
    'd27sesi2': "[WEBINAR SERIES] E-Sertifikat dan Materi Webinar Struktur dan Makna dalam Linguistik Bahasa Jepang"
};

var BODY = {
    'd25sesi1': [/* mail links */],
    'd25sesi2': [/* mail links */],
    'd26sesi1': [/* mail links */],
    'd26sesi2': [/* mail links */],
    'd27sesi1': [/* mail links */],
    'd27sesi2': [/* mail links */]]
};

for(let i = 0; i < SESSIONS.length; i++) {
    var data = BODY[SESSIONS[i]];
    var messageBody = `<p>Halo, partisipan!</p>
    <p>Terima kasih atas partisipasinya dalam Webinar Series Sastra Jepang Unpad 2020. E-Sertifikat terlampir pada email ini, dan untuk materi webinar dapat diunduh pada link di bawah ini:
    <br><a href="${data[0]}">${data[0]}</a></p>
    <p>Rekaman webinar dapat dilihat pada channel Fakultas Ilmu Budaya Unpad:
    <br><a href="https://www.youtube.com/channel/UCLMi2TVLAJuojJOVaTsBpRw">https://www.youtube.com/channel/UCLMi2TVLAJuojJOVaTsBpRw</a></p>
    <p>Jika anda memiliki kritik dan saran mengenai Webinar Series kami, silakan mengisi form berikut:
    <br><a href="http://bit.ly/kuesionerwebinarseriesSJ2020">http://bit.ly/kuesionerwebinarseriesSJ2020</a></p>
    <p>Sayonara! Sampai jumpa tahun depan!</p>

    <p>Salam,</p>
    
    <p>Panitia Webinar Series Sastra Jepang Unpad 2020</p>`;
    BODY[SESSIONS[i]] = messageBody;
}

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
                        address: address,
                    },
                    subject: SUBJECTS[session],
                    generateTextFromHTML: true,
                    html: BODY[session],
                    attachments: [
                        {
                            filename: "E-Sertifikat " + name + ".pdf",
                            path: 'save/' + session + '/' + filename + '.pdf',
                            contentType: 'application/pdf'
                        }
                    ]
                };

                smtpTransport.sendMail(mailOptions, (err, response) => {
                    if (err) reject(err);
                    console.log(response);
                    smtpTransport.close();
                    resolve(response);
                });
            });
        });
    }
};
