const fs = require('fs').promises;
const PDFDocument = require('pdf-lib').PDFDocument;
const rgb = require('pdf-lib').rgb;
const fontkit = require ('@pdf-lib/fontkit');

var fontPath = 'fonts/meiryo.ttf';
var fontSize = 32;

module.exports = {
    createPDF: (name) => {
        var timestamp = +new Date();
        var filename = timestamp;

        // Read base pdf
        return fs.readFile('materials/base_sertif.pdf').then((contents) => { return PDFDocument.load(contents) })
        .then((doc) => {
            // Register fontkit
            doc.registerFontkit(fontkit);
            // Load font
            return new Promise((resolve, reject) => {
                return fs.readFile(fontPath)
                .then((fontBytes) => {
                    return doc.embedFont(fontBytes)
                    .then((font) => { resolve({ doc, font }) });
                })
            })
        })
        .then(({doc, font}) => {
            return new Promise((resolve, reject) => {
                // Get the first page of the document
                const pages = doc.getPages()
                const firstPage = pages[0]

                // Draw text
                firstPage.drawText(name, {
                    x: (firstPage.getWidth() - font.widthOfTextAtSize(name, fontSize)) / 2,
                    y: 300,
                    size: fontSize,
                    font: font,
                    color: rgb(0.3, 0.3, 0.3)
                });

                // Write the pdf to a file
                doc.save().then((savedData) => {
                    fs.writeFile('save/'+filename+'.pdf', savedData).then(() => { resolve(filename) });
                })
            })
        });
    }
};
