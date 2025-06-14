import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Download, FileText, Upload, CheckSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { CaseFile, DownloadProgress as DownloadProgressType } from '@/types/files';
import EnhancedDownloadDialog from '@/components/EnhancedDownloadDialog';
import DownloadProgress from '@/components/DownloadProgress';

interface CaseFile {
  id: number;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  uploadedBy: string;
  caseNumber: string;
}

const Files = () => {
  const { toast } = useToast();
  const { isSeniorAssociate } = useAuth();
  const [files, setFiles] = useState<CaseFile[]>([
    {
      id: 1,
      name: 'Contract_Agreement_TechCorp.pdf',
      type: 'Contract',
      size: '2.5 MB',
      uploadDate: '2024-06-10',
      uploadedBy: 'Sarah Johnson',
      caseNumber: 'CASE-2024-001'
    },
    {
      id: 2,
      name: 'Court_Filing_Peterson.docx',
      type: 'Court Filing',
      size: '1.8 MB',
      uploadDate: '2024-06-09',
      uploadedBy: 'Michael Brown',
      caseNumber: 'CASE-2024-002'
    },
    {
      id: 3,
      name: 'Client_Statement_Estate.pdf',
      type: 'Statement',
      size: '950 KB',
      uploadDate: '2024-06-08',
      uploadedBy: 'Emily Davis',
      caseNumber: 'CASE-2024-003'
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Contract',
    caseNumber: '',
    file: null as File | null
  });
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [downloads, setDownloads] = useState<DownloadProgressType[]>([]);

  const fileTypes = ['Contract', 'Court Filing', 'Statement', 'Evidence', 'Correspondence', 'Other'];

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'Contract': return 'default';
      case 'Court Filing': return 'destructive';
      case 'Statement': return 'secondary';
      case 'Evidence': return 'outline';
      default: return 'outline';
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, file, name: file.name });
    }
  };

  const handleAddFile = () => {
    if (!formData.name || !formData.caseNumber || !formData.file) {
      toast({
        title: "Error",
        description: "Please fill in all fields and select a file",
        variant: "destructive",
      });
      return;
    }

    const newFile: CaseFile = {
      id: Date.now(),
      name: formData.name,
      type: formData.type,
      size: `${(formData.file.size / 1024 / 1024).toFixed(1)} MB`,
      uploadDate: new Date().toISOString().split('T')[0],
      uploadedBy: 'Current User', // This would come from auth context
      caseNumber: formData.caseNumber
    };

    setFiles([...files, newFile]);
    setFormData({ name: '', type: 'Contract', caseNumber: '', file: null });
    setIsDialogOpen(false);
    toast({
      title: "Success",
      description: "File uploaded successfully",
    });
  };

  const handleDeleteFile = (id: number) => {
    if (!isSeniorAssociate) {
      toast({
        title: "Access Denied",
        description: "Only Senior Associates can delete files",
        variant: "destructive",
      });
      return;
    }

    setFiles(files.filter(file => file.id !== id));
    toast({
      title: "Success",
      description: "File deleted successfully",
    });
  };

  const handleDownloadFile = (fileName: string) => {
    console.log(`Downloading file: ${fileName}`);
    toast({
      title: "Download Started",
      description: `Downloading ${fileName}`,
    });
  };

  const handleSelectFile = (fileId: number) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files.map(f => f.id));
    }
  };

  const getSelectedFiles = () => files.filter(f => selectedFiles.includes(f.id));

  const clearDownloads = () => {
    setDownloads([]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Case Files</h1>
          <p className="text-muted-foreground">Manage legal documents and case files</p>
        </div>
        <div className="flex gap-3">
          {selectedFiles.length > 0 && (
            <EnhancedDownloadDialog 
              files={getSelectedFiles()}
              trigger={
                <Button variant="outline" className="border-mna-accent text-mna-primary">
                  <Download size={16} className="mr-2" />
                  Download Selected ({selectedFiles.length})
                </Button>
              }
            />
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-mna-primary hover:bg-mna-primary/90">
                <Plus size={16} className="mr-2" />
                Upload File
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload New File</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file">Select File</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.txt,.jpg,.png"
                  />
                </div>
                <div>
                  <Label htmlFor="name">File Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter file name"
                  />
                </div>
                <div>
                  <Label htmlFor="type">File Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select file type" />
                    </SelectTrigger>
                    <SelectContent>
                      {fileTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="caseNumber">Case Number</Label>
                  <Input
                    id="caseNumber"
                    value={formData.caseNumber}
                    onChange={(e) => setFormData({...formData, caseNumber: e.target.value})}
                    placeholder="Enter case number"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleAddFile} className="flex-1">
                    <Upload size={16} className="mr-2" />
                    Upload File
                  </Button>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {files.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            className="flex items-center gap-2"
          >
            <CheckSquare size={14} />
            {selectedFiles.length === files.length ? 'Deselect All' : 'Select All'}
          </Button>
          <span className="text-sm text-muted-foreground">
            {selectedFiles.length} of {files.length} files selected
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {files.map((file) => (
          <Card key={file.id} className="hover:shadow-lg transition-all duration-200 hover:scale-105 animate-scale-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file.id)}
                    onChange={() => handleSelectFile(file.id)}
                    className="rounded border-gray-300"
                  />
                  <FileText size={20} className="text-mna-primary" />
                  <CardTitle className="text-lg truncate">{file.name}</CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getFileTypeColor(file.type) as any}>
                    {file.type}
                  </Badge>
                  {isSeniorAssociate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFile(file.id)}
                      className="text-mna-danger hover:text-mna-danger"
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Case Number:</span>
                <span className="text-sm font-medium">{file.caseNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Size:</span>
                <span className="text-sm font-medium">{file.size}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Uploaded:</span>
                <span className="text-sm font-medium">{file.uploadDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Uploaded by:</span>
                <span className="text-sm font-medium">{file.uploadedBy}</span>
              </div>
              <div className="pt-2 flex gap-2">
                <Button 
                  onClick={() => handleDownloadFile(file.name)}
                  variant="outline"
                  className="flex-1"
                >
                  <Download size={16} className="mr-2" />
                  Quick Download
                </Button>
                <EnhancedDownloadDialog 
                  files={[file]}
                  single
                  trigger={
                    <Button className="flex-1 bg-mna-accent hover:bg-mna-accent/90 text-mna-primary">
                      <Download size={16} className="mr-2" />
                      Enhanced
                    </Button>
                  }
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <DownloadProgress downloads={downloads} onClose={clearDownloads} />
    </div>
  );
};

export default Files;
