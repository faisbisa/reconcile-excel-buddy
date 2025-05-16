
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SheetData } from '@/utils/excelUtils';

interface DataPreviewProps {
  sheetData?: SheetData;
  fileName?: string;
  maxRows?: number;
}

const DataPreview: React.FC<DataPreviewProps> = ({
  sheetData,
  fileName,
  maxRows = 10,
}) => {
  if (!sheetData || !sheetData.data || sheetData.data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">No data to preview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Please upload an Excel file to see a preview.
          </p>
        </CardContent>
      </Card>
    );
  }

  const columns = Object.keys(sheetData.data[0]);
  const previewData = sheetData.data.slice(0, maxRows);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>
            Preview: {fileName} - {sheetData.name}
          </span>
          <span className="text-xs text-muted-foreground">
            Showing {Math.min(maxRows, sheetData.data.length)} of {sheetData.data.length} rows
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-80 rounded-md">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column} className="whitespace-nowrap">
                      {column}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {columns.map((column) => (
                      <TableCell key={`${rowIndex}-${column}`} className="whitespace-nowrap">
                        {row[column] !== undefined && row[column] !== null
                          ? String(row[column])
                          : ''}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default DataPreview;
