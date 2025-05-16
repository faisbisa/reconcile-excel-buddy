
import { read, utils } from 'xlsx';

export interface FileData {
  fileName: string;
  sheets: SheetData[];
}

export interface SheetData {
  name: string;
  data: any[];
}

export const parseExcelFile = async (file: File): Promise<FileData> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = read(arrayBuffer);
    
    const sheets: SheetData[] = workbook.SheetNames.map((name) => {
      const worksheet = workbook.Sheets[name];
      const data = utils.sheet_to_json(worksheet);
      return { name, data };
    });

    return {
      fileName: file.name,
      sheets,
    };
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    throw new Error('Failed to parse Excel file. Please check the file format.');
  }
};

export const findCommonColumns = (data1: any[], data2: any[]): string[] => {
  if (!data1.length || !data2.length) return [];
  
  const columns1 = Object.keys(data1[0]);
  const columns2 = Object.keys(data2[0]);
  
  return columns1.filter(col => columns2.includes(col));
};

export interface ReconciliationResult {
  matches: number;
  mismatches: number;
  onlyInFirst: number;
  onlyInSecond: number;
  details: ReconciliationDetail[];
}

export interface ReconciliationDetail {
  key: string;
  inFirstFile: boolean;
  inSecondFile: boolean;
  firstValue?: any;
  secondValue?: any;
  isMatch: boolean;
}

export const reconcileData = (
  data1: any[],
  data2: any[],
  keyColumn: string,
  columnsToCompare: string[]
): ReconciliationResult => {
  const result: ReconciliationResult = {
    matches: 0,
    mismatches: 0,
    onlyInFirst: 0,
    onlyInSecond: 0,
    details: [],
  };

  const map1 = new Map(data1.map(item => [item[keyColumn], item]));
  const map2 = new Map(data2.map(item => [item[keyColumn], item]));
  
  // Check records in first file
  for (const [key, item1] of map1.entries()) {
    const item2 = map2.get(key);
    
    if (item2) {
      let isMatch = true;
      for (const col of columnsToCompare) {
        if (item1[col] !== item2[col]) {
          isMatch = false;
          break;
        }
      }
      
      result.details.push({
        key: String(key),
        inFirstFile: true,
        inSecondFile: true,
        firstValue: item1,
        secondValue: item2,
        isMatch,
      });
      
      if (isMatch) {
        result.matches++;
      } else {
        result.mismatches++;
      }
    } else {
      result.onlyInFirst++;
      result.details.push({
        key: String(key),
        inFirstFile: true,
        inSecondFile: false,
        firstValue: item1,
        isMatch: false,
      });
    }
  }
  
  // Check records only in second file
  for (const [key, item2] of map2.entries()) {
    if (!map1.has(key)) {
      result.onlyInSecond++;
      result.details.push({
        key: String(key),
        inFirstFile: false,
        inSecondFile: true,
        secondValue: item2,
        isMatch: false,
      });
    }
  }
  
  return result;
};
