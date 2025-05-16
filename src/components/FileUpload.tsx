
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadProps {
  onFileUploaded: (file: File) => void;
  index: number;
  label: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUploaded, index, label }) => {
  const [fileName, setFileName] = useState<string>('');
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Please upload a valid Excel file (.xlsx or .xls)');
      return;
    }
    
    setFileName(file.name);
    onFileUploaded(file);
    toast.success(`File "${file.name}" uploaded successfully`);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col">
        <label htmlFor={`file-upload-${index}`} className="text-sm font-medium mb-2">
          {label}
        </label>
        <div className="flex gap-2">
          <Input
            id={`file-upload-${index}`}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => document.getElementById(`file-upload-${index}`)?.click()}
          >
            <FileText className="h-4 w-4" />
            {fileName ? 'Change File' : 'Select Excel File'}
          </Button>
          {fileName && (
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => {
                setFileName('');
                // Reset input
                const input = document.getElementById(`file-upload-${index}`) as HTMLInputElement;
                if (input) input.value = '';
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </div>
      {fileName && (
        <p className="text-sm text-muted-foreground truncate">
          Selected: {fileName}
        </p>
      )}
    </div>
  );
};

export default FileUpload;
