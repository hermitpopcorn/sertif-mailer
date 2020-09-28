const ExcelJS = require('exceljs');

function definePDFColumns(sheet) {
    sheet.columns = [
        { header: 'Timestamp', key: 'timestamp', style: { numFmt: 'yyyy-mm-dd hh:mm:ss' } },
        { header: 'Sesi', key: 'session' },
        { header: 'Nama', key: 'name' },
        { header: 'Email', key: 'email' },
        { header: 'Filename', key: 'filename' }
    ];

    return true;
}

function defineMailedColumns(sheet) {
    sheet.columns = [
        { header: 'Timestamp', key: 'timestamp', style: { numFmt: 'yyyy-mm-dd hh:mm:ss' } },
        { header: 'Sesi', key: 'session' },
        { header: 'Nama', key: 'name' },
        { header: 'Email', key: 'email' },
        { header: 'Status', key: 'status' }
    ];

    return true;
}

// Prep the file
const workbook = new ExcelJS.Workbook();
workbook.xlsx.readFile('log.xlsx').then((book) => {
    var sheet = workbook.getWorksheet('PDF');
    if (!sheet) { sheet = workbook.addWorksheet('PDF'); }
    definePDFColumns(sheet);
    sheet = workbook.getWorksheet('Mailed');
    if (!sheet) { sheet = workbook.addWorksheet('Mailed'); }
    defineMailedColumns(sheet);
    workbook.xlsx.writeFile('log.xlsx');
}).catch((error) => {
    var sheet = workbook.addWorksheet('PDF');
    definePDFColumns(sheet);
    sheet = workbook.addWorksheet('Mailed');
    defineMailedColumns(sheet);
    workbook.xlsx.writeFile('log.xlsx');
});

module.exports = {
    write: (sheet, data) => {
        var sheet = workbook.getWorksheet(sheet);
        sheet.addRow(data);
        workbook.xlsx.writeFile('log.xlsx');
    }
};