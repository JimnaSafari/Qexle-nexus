
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Download, FileText } from 'lucide-react';
import { CaseFile } from '@/types/files';
import { downloadFile, downloadMultipleFiles, getDownloadFormats, DownloadFormat } from '@/utils/downloadUtils';
import { useToast } from '@/hooks/use-toast';

interface EnhancedDownloadDialogProps {
  files: CaseFile[];
  trigger?: React.ReactNode;
  single?: boolean;
}

const EnhancedDownloadDialog = ({ files, trigger, single = false }: EnhancedDownloadDialogProps) => {
  const [selectedFormat, setSelectedFormat] = useState<DownloadFormat>('pdf');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const downloadFormats = getDownloadFormats();

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      if (single && files.length === 1) {
        await downloadFile(files[0], selectedFormat);
        toast({
          title: "Download Started",
          description: `Downloading ${files[0].name} as ${selectedFormat.toUpperCase()}`,
        });
      } else {
        await downloadMultipleFiles(files, selectedFormat);
        toast({
          title: "Download Started",
          description: `Downloading ${files.length} files as ${selectedFormat.toUpperCase()}`,
        });
      }
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to download files",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const defaultTrigger = (
    <Button className="bg-mna-accent hover:bg-mna-accent/90 text-mna-primary">
      <Download size={16} className="mr-2" />
      Enhanced Download
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText size={20} />
            Download Options
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {single ? `Downloading: ${files[0]?.name}` : `Downloading ${files.length} files`}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="format">Download Format</Label>
            <Select value={selectedFormat} onValueChange={(value: DownloadFormat) => setSelectedFormat(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select download format" />
              </SelectTrigger>
              <SelectContent>
                {downloadFormats.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{format.label}</span>
                      <span className="text-xs text-muted-foreground">{format.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted/30 p-3 rounded-lg text-sm">
            <strong>Format Details:</strong>
            <ul className="mt-1 space-y-1">
              {selectedFormat === 'pdf' && <li>• Converts files to PDF format for easy viewing</li>}
              {selectedFormat === 'excel' && <li>• Creates Excel spreadsheet with file metadata</li>}
              {selectedFormat === 'csv' && <li>• Exports file information as CSV for data analysis</li>}
              {selectedFormat === 'zip' && <li>• Bundles all files in a compressed ZIP archive</li>}
            </ul>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleDownload}
              className="flex-1"
              disabled={isDownloading}
            >
              <Download size={16} className="mr-2" />
              {isDownloading ? 'Downloading...' : 'Download'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isDownloading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedDownloadDialog;
