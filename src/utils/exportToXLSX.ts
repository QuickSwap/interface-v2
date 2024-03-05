import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

export const exportToXLSX = (
  xlsxData: any[],
  fileName: string,
  headCells?: string[],
) => {
  const fileType =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  const fileExtension = '.csv';
  let ws = XLSX.utils.json_to_sheet(xlsxData);
  if (headCells) {
    ws = XLSX.utils.sheet_add_aoa(ws, [headCells], { origin: 'A1' });
  }
  const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
  const excelBuffer = XLSX.write(wb, { bookType: 'csv', type: 'array' });
  const data = new Blob([excelBuffer], { type: fileType });
  FileSaver.saveAs(data, fileName + fileExtension);
};
