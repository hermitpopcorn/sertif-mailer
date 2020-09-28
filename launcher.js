require('dotenv').config()
const fs = require('fs');
const fsPromises = fs.promises;
const ExcelJS = require('exceljs');
const moment = require('moment');
const mailer = require('./mailer_test.js');
const logger = require('./logger.js');
const { TextTooLongError, InsufficientArgumentsError, SheetNotFoundError } = require('./errors.js');

// Get sessions from argument
if (process.argv.length < 3) { throw new InsufficientArgumentsError(); };
var sessionList = [];
process.argv.forEach((element, index) => {
    if (index < 2) { return; }
    sessionList.push(element);
});

// Loop for each argument
sessionList.forEach(session => {
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

            // Infer cert filename
            var filename = ("000" + rowNumber).slice(-4) + '-' + email;
            // Check if cert file exists
            fsPromises.access('save/' + session + '/' + filename + '.pdf', fs.constants.R_OK)
            .then(() => {
                mailer.send(session, filename, email, name)
                .then((response) => {
                    console.log(response); // TODO: delete on production
                    console.log("Sent: " + filename + '.pdf to ' + email);
                    logger.write('Mailed', [moment().utcOffset(0, true).toDate(), session, name, email, 'SENT']);
                })
                .catch((err) => {
                    console.log("FAILED SENDING: " + filename + '.pdf to ' + email);
                    console.log(err);
                    logger.write('Mailed', [moment().utcOffset(0, true).toDate(), session, name, email, 'SENDING FAILED: ' + err]);
                });
            })
            .catch(() => {
                console.log("CERT NOT FOUND: " + filename + '.pdf');
                logger.write('Mailed', [moment().utcOffset(0, true).toDate(), session, name, email, 'NOT SENT: CERT NOT FOUND']);
            });
        });
    });   
});