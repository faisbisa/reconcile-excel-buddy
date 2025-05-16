
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import FileUpload from '@/components/FileUpload';
import DataPreview from '@/components/DataPreview';
import ReconciliationResults from '@/components/ReconciliationResults';
import { FileData, SheetData, parseExcelFile, findCommonColumns, reconcileData, ReconciliationResult } from '@/utils/excelUtils';
import { toast } from 'sonner';
import { Compare, Excel } from 'lucide-react';

const Index = () => {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [fileData1, setFileData1] = useState<FileData | null>(null);
  const [fileData2, setFileData2] = useState<FileData | null>(null);
  const [selectedSheet1, setSelectedSheet1] = useState<SheetData | null>(null);
  const [selectedSheet2, setSelectedSheet2] = useState<SheetData | null>(null);
  const [keyColumn, setKeyColumn] = useState<string>('');
  const [columnsToCompare, setColumnsToCompare] = useState<string[]>([]);
  const [commonColumns, setCommonColumns] = useState<string[]>([]);
  const [reconciliationResult, setReconciliationResult] = useState<ReconciliationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (file: File, isFirstFile: boolean) => {
    try {
      if (isFirstFile) {
        setFile1(file);
        setSelectedSheet1(null);
        setFileData1(null);
      } else {
        setFile2(file);
        setSelectedSheet2(null);
        setFileData2(null);
      }
      
      setReconciliationResult(null);
      setKeyColumn('');
      setColumnsToCompare([]);
      setCommonColumns([]);
      
      const data = await parseExcelFile(file);
      
      if (isFirstFile) {
        setFileData1(data);
        if (data.sheets.length > 0) {
          setSelectedSheet1(data.sheets[0]);
        }
      } else {
        setFileData2(data);
        if (data.sheets.length > 0) {
          setSelectedSheet2(data.sheets[0]);
        }
      }
      
      // If both files have data, find common columns
      if (
        (isFirstFile && fileData2) || 
        (!isFirstFile && fileData1)
      ) {
        const sheet1 = isFirstFile ? data.sheets[0] : fileData1!.sheets[0];
        const sheet2 = isFirstFile ? fileData2!.sheets[0] : data.sheets[0];
        
        if (sheet1.data.length > 0 && sheet2.data.length > 0) {
          const common = findCommonColumns(sheet1.data, sheet2.data);
          setCommonColumns(common);
          if (common.length > 0) {
            setKeyColumn(common[0]);
          }
        }
      }
    } catch (error) {
      toast.error('Error processing file: ' + (error as Error).message);
    }
  };

  const handleSheetChange = (sheetName: string, isFirstFile: boolean) => {
    if (isFirstFile && fileData1) {
      const sheet = fileData1.sheets.find((s) => s.name === sheetName);
      if (sheet) setSelectedSheet1(sheet);
    } else if (!isFirstFile && fileData2) {
      const sheet = fileData2.sheets.find((s) => s.name === sheetName);
      if (sheet) setSelectedSheet2(sheet);
    }

    // Update common columns when sheets change
    if (selectedSheet1 && selectedSheet2) {
      const common = findCommonColumns(selectedSheet1.data, selectedSheet2.data);
      setCommonColumns(common);
      setKeyColumn(common.length > 0 ? common[0] : '');
      setColumnsToCompare(common);
    }
  };

  const handleColumnCheck = (column: string, checked: boolean) => {
    if (checked) {
      setColumnsToCompare([...columnsToCompare, column]);
    } else {
      setColumnsToCompare(columnsToCompare.filter((col) => col !== column));
    }
  };

  const handleReconcile = () => {
    if (!selectedSheet1 || !selectedSheet2 || !keyColumn || columnsToCompare.length === 0) {
      toast.error('Please select sheets, key column, and at least one column to compare');
      return;
    }

    setIsLoading(true);

    try {
      const result = reconcileData(
        selectedSheet1.data,
        selectedSheet2.data,
        keyColumn,
        columnsToCompare
      );
      
      setReconciliationResult(result);
      toast.success('Data reconciliation completed');
    } catch (error) {
      toast.error('Error during reconciliation: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Excel className="h-8 w-8 text-blue-500" />
          Excel Reconciliation Buddy
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Upload two Excel files, select the sheets and columns to compare, and identify discrepancies between your datasets.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>First Dataset</CardTitle>
            <CardDescription>Upload your primary Excel file</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload onFileUploaded={(file) => handleFileUpload(file, true)} index={1} label="Upload File 1" />
            
            {fileData1 && (
              <div className="mt-4">
                <label className="text-sm font-medium mb-2 block">Select Sheet</label>
                <Select
                  value={selectedSheet1?.name || ''}
                  onValueChange={(value) => handleSheetChange(value, true)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a sheet" />
                  </SelectTrigger>
                  <SelectContent>
                    {fileData1.sheets.map((sheet) => (
                      <SelectItem key={sheet.name} value={sheet.name}>
                        {sheet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Second Dataset</CardTitle>
            <CardDescription>Upload your comparison Excel file</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload onFileUploaded={(file) => handleFileUpload(file, false)} index={2} label="Upload File 2" />
            
            {fileData2 && (
              <div className="mt-4">
                <label className="text-sm font-medium mb-2 block">Select Sheet</label>
                <Select
                  value={selectedSheet2?.name || ''}
                  onValueChange={(value) => handleSheetChange(value, false)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a sheet" />
                  </SelectTrigger>
                  <SelectContent>
                    {fileData2.sheets.map((sheet) => (
                      <SelectItem key={sheet.name} value={sheet.name}>
                        {sheet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedSheet1 && selectedSheet2 && commonColumns.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Configure Comparison</CardTitle>
            <CardDescription>Select the key column and fields to compare</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Key Column (for matching records)</label>
                <Select value={keyColumn} onValueChange={setKeyColumn}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select key column" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonColumns.map((column) => (
                      <SelectItem key={column} value={column}>
                        {column}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Columns to Compare</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-2">
                  {commonColumns.map((column) => (
                    <div key={column} className="flex items-center space-x-2">
                      <Checkbox
                        id={`column-${column}`}
                        checked={columnsToCompare.includes(column)}
                        onCheckedChange={(checked) => handleColumnCheck(column, checked === true)}
                      />
                      <label
                        htmlFor={`column-${column}`}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {column}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-center">
              <Button 
                onClick={handleReconcile}
                disabled={isLoading || !keyColumn || columnsToCompare.length === 0}
                className="px-8"
              >
                {isLoading ? "Processing..." : "Reconcile Data"}
                {!isLoading && <Compare className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {selectedSheet1 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Data Preview (File 1)</h2>
          <DataPreview 
            sheetData={selectedSheet1}
            fileName={fileData1?.fileName}
          />
        </div>
      )}
      
      {selectedSheet2 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Data Preview (File 2)</h2>
          <DataPreview 
            sheetData={selectedSheet2}
            fileName={fileData2?.fileName}
          />
        </div>
      )}
      
      {reconciliationResult && (
        <ReconciliationResults 
          result={reconciliationResult}
          columnsToCompare={columnsToCompare}
          keyColumn={keyColumn}
        />
      )}
    </div>
  );
};

export default Index;
