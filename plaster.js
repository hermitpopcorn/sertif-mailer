require('dotenv').config()
const fs = require('fs').promises;
const ExcelJS = require('exceljs');
const imageCertCreator = require('./img_cert_creator.js');
const { TextTooLongError, InsufficientArgumentsError, SheetNotFoundError } = require('./errors.js');

if (process.argv.length < 3) { throw new InsufficientArgumentsError(); };
var session = process.argv[2];

// Reading the Excel
var workbook = new ExcelJS.Workbook();
workbook.xlsx.readFile("materials/" + session + '.xlsx').then((book) => {
    var sheet = book.getWorksheet('SERTIFIKAT');
    if (!sheet) { throw new SheetNotFoundError(); }
    
    // Iterate each row
    sheet.eachRow((row, rowNumber) => {
        // Skip first row (head)
        if (rowNumber == 1) { return true; }

        // If "name" cell has value
        if (!row.getCell('C').value) { return true; }

        // Only if "name" cell has "highlight" fill
        let fill = row.getCell('C').fill;
        if (!fill) { return true; }
        if (!fill.fgColor) { return true; }
        if (fill.fgColor.argb !== 'FFFFFF00') { return true; }

        // Get data
        var email = row.getCell('B').value;
        if (typeof email === 'object') { email = email.text }
        var name = row.getCell('C').value;
        // Start writing
        let certificateByDrawingTextOnImage = imageCertCreator.createPNG(session, rowNumber, name, email);
        certificateByDrawingTextOnImage
        .then((filename) => imageCertCreator.PDFize(session, filename))
        .then((filename) => {
            console.log("Created: " + filename + '.pdf');
        });
    });
});

return;

// TODO: send mail (by reading mail contents from an external file)
// TODO: write to log
/*
console.log(`Mail sent to ${email}.`);
let ts = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
fs.writeFile('log.txt', `[${ts}] mailer: Sent "${filename}.pdf" to ${email} (${name}).\n`, { flag: 'a' });
*/