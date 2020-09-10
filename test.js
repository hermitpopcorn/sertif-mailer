require('dotenv').config()
const fs = require('fs').promises;
const imageCertCreator = require('./img_cert_creator.js');
const pdfCertEditor = require('./pdf_cert_editor.js');
const mailer = require('./mailer.js');
const { TextTooLongError } = require('./errors.js');

var name = "Jhoson McMiller 丘の向こウ";
var email = "dani.hmng@gmail.com";

let certificateByPlasteringTextOnPDF = pdfCertEditor.createPDF(name);
certificateByPlasteringTextOnPDF.then(filename => {
    console.log(filename);
    let ts = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    fs.writeFile('log.txt', `[${ts}] pdfce: Created "${filename}.pdf" for ${name}.\n`, { flag: 'a' });

    mailer.send(filename, email, name)
    .then(() => {
        console.log(`Mail sent to ${email}.`);
        let ts = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
        fs.writeFile('log.txt', `[${ts}] mailer: Sent "${filename}.pdf" to ${email} (${name}).\n`, { flag: 'a' });
    });
});

let certificateByDrawingTextOnImage = imageCertCreator.createPDF(name);
certificateByDrawingTextOnImage.then(filename => {
    console.log(filename);
    let ts = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    fs.writeFile('log.txt', `[${ts}] imgcr: Created "${filename}.pdf" for ${name}.\n`, { flag: 'a' });

    mailer.send(filename, email, name)
    .then(() => {
        console.log(`Mail sent to ${email}.`);
        let ts = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
        fs.writeFile('log.txt', `[${ts}] mailer: Sent "${filename}.pdf" to ${email} (${name}).\n`, { flag: 'a' });
    });
})
.catch(error => {
    if (error.constructor.name == "TextTooLongError") {
        console.log("Canceled: name too long.");
        let ts = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
        fs.writeFile('log.txt', `[${ts}] imgcr: CANCELED "${error.data.filename}.pdf" because name (${name}) was too long.\n`, { flag: 'a' });
    }
});
