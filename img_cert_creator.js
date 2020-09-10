const fs = require('fs').promises;
const fsSync = require('fs');
const sharp = require('sharp');
const TextToSVG = require('text-to-svg');
const PDFDocument = require('pdfkit');

var fontPath = 'fonts/meiryo.ttf';
var fontSize = 150;
const text2svg = TextToSVG.loadSync(fontPath);

const { TextTooLongError } = require('./errors.js');

module.exports = {
    createPDF: (name) => {
        var timestamp = +new Date();
        var filename = timestamp;

        // Composite svg
        return new Promise((resolve, reject) => {
            const svg = text2svg.getSVG(name, { x: 0, y: 0, fontSize: fontSize, anchor: 'top', attributes: { fill: 'black', stroke: 'black' } });
            fs.writeFile('save/tmp/svg_'+filename+'.svg', svg).then(() => {
                // Convert to png
                sharp('save/tmp/svg_'+filename+'.svg')
                .blur(2)
                .toFormat('png')
                .toFile('save/tmp/text_'+filename+'.png')
                .then(info => {
                    fs.unlink('save/tmp/svg_'+filename+'.svg');
                    resolve()
                })
                .catch(err => { throw err });
            })
            .catch(err => { throw err });
        })

        // Create certificate png
        .then(() => {
            return new Promise((resolve, reject) => {
                sharp('save/tmp/text_'+filename+'.png')
                .metadata()
                .then(metadata => {
                    if (Math.round(metadata.width) > 2000) reject(new TextTooLongError({ filename: filename }));

                    sharp('materials/base_sertif.png')
                    .composite([{
                        input: 'save/tmp/text_'+filename+'.png',
                        left: 2036 - Math.round(metadata.width / 2),
                        top: 740 - Math.round(metadata.height / 2)
                    }])
                    .toFormat('png')
                    .toFile('save/tmp/'+filename+'.png')
                    .then(info => {
                        fs.unlink('save/tmp/text_'+filename+'.png');
                        resolve();
                    })
                    .catch(err => { throw err })
                });
            });
        })

        // Create certificate pdf
        .then(() => {
            return new Promise((resolve, reject) => {
                var image = 'save/tmp/'+filename+'.png';

                const doc = new PDFDocument({
                    layout: 'landscape',
                    size: 'A4'
                });
                doc.image(image, 0, 0, { width: 841.89 });

                doc.pipe(fsSync.createWriteStream('save/'+filename+'.pdf'));
                doc.end();

                fs.unlink('save/tmp/'+filename+'.png');
                resolve(filename);
            });
        })
    }
};
