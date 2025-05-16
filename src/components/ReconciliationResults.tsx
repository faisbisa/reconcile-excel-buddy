
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReconciliationResult } from '@/utils/excelUtils';
import { Progress } from '@/components/ui/progress';

interface ReconciliationResultsProps {
  result?: ReconciliationResult;
  columnsToCompare: string[];
  keyColumn: string;
}

const ReconciliationResults: React.FC<ReconciliationResultsProps> = ({
  result,
  columnsToCompare,
  keyColumn,
}) => {
  if (!result) {
    return null;
  }

  const totalRecords = result.matches + result.mismatches + result.onlyInFirst + result.onlyInSecond;
  const matchPercentage = totalRecords > 0 ? Math.round((result.matches / totalRecords) * 100) : 0;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Reconciliation Results</CardTitle>
        <CardDescription>
          Comparing data using "{keyColumn}" as the key column
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-lg">Matches</CardTitle>
            </CardHeader>
            <CardContent className="py-2 px-4">
              <p className="text-2xl font-bold text-green-600">{result.matches}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-lg">Mismatches</CardTitle>
            </CardHeader>
            <CardContent className="py-2 px-4">
              <p className="text-2xl font-bold text-amber-600">{result.mismatches}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-lg">Only in First</CardTitle>
            </CardHeader>
            <CardContent className="py-2 px-4">
              <p className="text-2xl font-bold text-blue-600">{result.onlyInFirst}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-lg">Only in Second</CardTitle>
            </CardHeader>
            <CardContent className="py-2 px-4">
              <p className="text-2xl font-bold text-purple-600">{result.onlyInSecond}</p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Match Accuracy</span>
            <span className="text-sm font-medium">{matchPercentage}%</span>
          </div>
          <Progress value={matchPercentage} className="h-2" />
        </div>

        <Tabs defaultValue="all" className="mt-6">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Records</TabsTrigger>
            <TabsTrigger value="mismatches">Mismatches</TabsTrigger>
            <TabsTrigger value="onlyFirst">Only in First</TabsTrigger>
            <TabsTrigger value="onlySecond">Only in Second</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <ScrollArea className="h-[400px]">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Key</TableHead>
                      <TableHead className="w-[120px]">Status</TableHead>
                      {columnsToCompare.map((col) => (
                        <React.Fragment key={col}>
                          <TableHead>{col} (File 1)</TableHead>
                          <TableHead>{col} (File 2)</TableHead>
                        </React.Fragment>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.details.map((detail, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{detail.key}</TableCell>
                        <TableCell>
                          {detail.isMatch ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Match
                            </Badge>
                          ) : detail.inFirstFile && detail.inSecondFile ? (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              Mismatch
                            </Badge>
                          ) : detail.inFirstFile ? (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              Only in First
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              Only in Second
                            </Badge>
                          )}
                        </TableCell>
                        {columnsToCompare.map((col) => (
                          <React.Fragment key={col}>
                            <TableCell className={detail.inFirstFile && detail.inSecondFile && detail.firstValue?.[col] !== detail.secondValue?.[col] ? "bg-amber-50" : ""}>
                              {detail.firstValue?.[col] !== undefined ? String(detail.firstValue[col]) : "-"}
                            </TableCell>
                            <TableCell className={detail.inFirstFile && detail.inSecondFile && detail.firstValue?.[col] !== detail.secondValue?.[col] ? "bg-amber-50" : ""}>
                              {detail.secondValue?.[col] !== undefined ? String(detail.secondValue[col]) : "-"}
                            </TableCell>
                          </React.Fragment>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="mismatches">
            <ScrollArea className="h-[400px]">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Key</TableHead>
                      {columnsToCompare.map((col) => (
                        <React.Fragment key={col}>
                          <TableHead>{col} (File 1)</TableHead>
                          <TableHead>{col} (File 2)</TableHead>
                        </React.Fragment>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.details
                      .filter((detail) => detail.inFirstFile && detail.inSecondFile && !detail.isMatch)
                      .map((detail, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{detail.key}</TableCell>
                          {columnsToCompare.map((col) => (
                            <React.Fragment key={col}>
                              <TableCell className={detail.firstValue?.[col] !== detail.secondValue?.[col] ? "bg-amber-50" : ""}>
                                {detail.firstValue?.[col] !== undefined ? String(detail.firstValue[col]) : "-"}
                              </TableCell>
                              <TableCell className={detail.firstValue?.[col] !== detail.secondValue?.[col] ? "bg-amber-50" : ""}>
                                {detail.secondValue?.[col] !== undefined ? String(detail.secondValue[col]) : "-"}
                              </TableCell>
                            </React.Fragment>
                          ))}
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="onlyFirst">
            <ScrollArea className="h-[400px]">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Key</TableHead>
                      {columnsToCompare.map((col) => (
                        <TableHead key={col}>{col}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.details
                      .filter((detail) => detail.inFirstFile && !detail.inSecondFile)
                      .map((detail, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{detail.key}</TableCell>
                          {columnsToCompare.map((col) => (
                            <TableCell key={col}>
                              {detail.firstValue?.[col] !== undefined ? String(detail.firstValue[col]) : "-"}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="onlySecond">
            <ScrollArea className="h-[400px]">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Key</TableHead>
                      {columnsToCompare.map((col) => (
                        <TableHead key={col}>{col}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.details
                      .filter((detail) => !detail.inFirstFile && detail.inSecondFile)
                      .map((detail, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{detail.key}</TableCell>
                          {columnsToCompare.map((col) => (
                            <TableCell key={col}>
                              {detail.secondValue?.[col] !== undefined ? String(detail.secondValue[col]) : "-"}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ReconciliationResults;
