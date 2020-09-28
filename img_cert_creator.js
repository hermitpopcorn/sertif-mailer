const fs = require('fs').promises;
const fsSync = require('fs');
const sharp = require('sharp');
const TextToSVG = require('text-to-svg');
const PDFDocument = require('pdfkit');

var fontPath = 'fonts/Philosopher-Regular.ttf';
var fontSize = 90;
const text2svg = TextToSVG.loadSync(fontPath);

const { TextTooLongError } = require('./errors.js');
const { resolve } = require('path');

const TEXTCOLORS = {
    d25sesi1: '#3e3350',
    d25sesi2: '#ffffff',
    d26sesi1: '#ffffff',
    d26sesi2: '#746550',
    d27sesi1: '#7c4e99',
    d27sesi2: '#bb1a4e'
}

module.exports = {
    createPNG: (session, id, name, email) => {
        var base = 'materials/' + session + '.png';
        var filename = ("000"+id).slice(-4) + "-" + email;

        // Prep folder(s)
        if (!fsSync.existsSync('save/tmp')) {
            fsSync.mkdirSync('save/tmp');
        }
        if (!fsSync.existsSync('save/' + session)) {
            fsSync.mkdirSync('save/' + session);
        }
        if (!fsSync.existsSync('save/tmp/' + session)) {
            fsSync.mkdirSync('save/tmp/' + session);
        }

        var _fontSize = fontSize;
        if (name.length > 40) { _fontSize -= 5; }
        if (name.length > 35) { _fontSize -= 5; }
        if (name.length > 30) { _fontSize -= 5; }
        if (name.length > 25) { _fontSize -= 5; }
        if (name.length > 20) { _fontSize -= 5; }

        // Composite svg
        return new Promise((resolve, reject) => {
            const svg = text2svg.getSVG(name, { x: 0, y: 0, fontSize: _fontSize, anchor: 'top', attributes: { fill: TEXTCOLORS[session] } });
            fs.writeFile('save/tmp/' + session + '/svg_'+filename+'.svg', svg).then(() => {
                // Convert to png
                sharp('save/tmp/' + session + '/svg_'+filename+'.svg')
                .toFormat('png')
                .toFile('save/tmp/' + session + '/text_'+filename+'.png')
                .then(info => {
                    fs.unlink('save/tmp/' + session + '/svg_'+filename+'.svg');
                    resolve()
                })
                .catch(err => { throw err });
            })
            .catch(err => { throw err });
        })

        // Create certificate png
        .then(() => {
            return new Promise((resolve, reject) => {
                sharp('save/tmp/' + session + '/text_'+filename+'.png')
                .metadata()
                .then(metadata => {
                    if ((Math.round(metadata.width) / 2) > 700) reject(new TextTooLongError({ filename: filename, text: name }));

                    sharp(base)
                    .composite([{
                        input: 'save/tmp/' + session + '/text_'+filename+'.png',
                        left: 877 - Math.round(metadata.width / 2),
                        top: 497 - Math.round(metadata.height / 2)
                    }])
                    .png()
                    .toFile('save/' + session + '/'+filename+'.png')
                    .then(info => {
                        fs.unlink('save/tmp/' + session + '/text_'+filename+'.png');
                        resolve(filename);
                    })
                    .catch(err => { throw err })
                });
            });
        })
    },

    PDFize: (session, filename) => {
        return new Promise((resolve, reject) => {
            var image = 'save/' + session + '/' + filename + '.png';

            const doc = new PDFDocument({
                layout: 'landscape',
                size: 'A4'
            });
            doc.image(image, 0, 0, { width: 841.89 });

            doc.pipe(fsSync.createWriteStream('save/' + session + '/' + filename + '.pdf'));
            doc.end();

            fs.unlink('save/' + session + '/' + filename + '.png');
            resolve(filename);
        });
    }
};
