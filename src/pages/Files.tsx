
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CourtFile {
  id: number;
  title: string;
  type: string;
  status: string;
  handler: string;
  lastUpdated: string;
  description?: string;
  client?: string;
}

const Files = () => {
  const { toast } = useToast();
  const [files, setFiles] = useState<CourtFile[]>([
    { 
      id: 1, 
      title: 'Johnson vs. Smith - Contract Dispute', 
      type: 'Court', 
      status: 'Active',
      handler: 'Sarah Johnson',
      lastUpdated: '2024-06-10',
      description: 'Contract dispute case involving breach of terms',
      client: 'Johnson Industries'
    },
    { 
      id: 2, 
      title: 'Peterson Estate Planning', 
      type: 'General', 
      status: 'Complete',
      handler: 'Michael Brown',
      lastUpdated: '2024-06-08',
      description: 'Complete estate planning documentation',
      client: 'Peterson Family'
    },
    { 
      id: 3, 
      title: 'Corporate Merger - TechCorp', 
      type: 'Court', 
      status: 'Pending',
      handler: 'Emily Davis',
      lastUpdated: '2024-06-09',
      description: 'Corporate merger legal documentation and review',
      client: 'TechCorp Industries'
    },
    { 
      id: 4, 
      title: 'Wilson Family Trust', 
      type: 'General', 
      status: 'Active',
      handler: 'David Wilson',
      lastUpdated: '2024-06-10',
      description: 'Family trust setup and documentation',
      client: 'Wilson Family'
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<CourtFile | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    status: '',
    handler: '',
    lastUpdated: '',
    description: '',
    client: ''
  });

  const fileTypes = ['Court', 'General'];
  const statuses = ['Active', 'Pending', 'Complete', 'On Hold'];
  const handlers = ['Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'default';
      case 'Complete': return 'mna-success';
      case 'Pending': return 'mna-warning';
      case 'On Hold': return 'mna-grey';
      default: return 'outline';
    }
  };

  const handleAddFile = () => {
    if (!formData.title || !formData.type || !formData.status || !formData.handler) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const newFile: CourtFile = {
      id: Date.now(),
      ...formData,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    setFiles([...files, newFile]);
    setFormData({ title: '', type: '', status: '', handler: '', lastUpdated: '', description: '', client: '' });
    setIsDialogOpen(false);
    toast({
      title: "Success",
      description: "Court file created successfully",
    });
  };

  const handleEditFile = () => {
    if (!editingFile || !formData.title || !formData.type || !formData.status || !formData.handler) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setFiles(files.map(file => 
      file.id === editingFile.id 
        ? { ...file, ...formData, lastUpdated: new Date().toISOString().split('T')[0] }
        : file
    ));
    setEditingFile(null);
    setFormData({ title: '', type: '', status: '', handler: '', lastUpdated: '', description: '', client: '' });
    setIsDialogOpen(false);
    toast({
      title: "Success",
      description: "Court file updated successfully",
    });
  };

  const handleDeleteFile = (id: number) => {
    setFiles(files.filter(file => file.id !== id));
    toast({
      title: "Success",
      description: "Court file deleted successfully",
    });
  };

  const openEditDialog = (file: CourtFile) => {
    setEditingFile(file);
    setFormData({
      title: file.title,
      type: file.type,
      status: file.status,
      handler: file.handler,
      lastUpdated: file.lastUpdated,
      description: file.description || '',
      client: file.client || ''
    });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingFile(null);
    setFormData({ title: '', type: '', status: '', handler: '', lastUpdated: '', description: '', client: '' });
    setIsDialogOpen(true);
  };

  const courtFiles = files.filter(file => file.type === 'Court');
  const generalFiles = files.filter(file => file.type === 'General');

  const FileCard = ({ file }: { file: CourtFile }) => (
    <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 animate-scale-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{file.title}</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge 
              variant="outline" 
              className={`border-${getStatusColor(file.status)} text-${getStatusColor(file.status)}`}
            >
              {file.status}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openEditDialog(file)}
            >
              <Edit size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteFile(file.id)}
              className="text-mna-danger hover:text-mna-danger"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Handler:</span>
          <span className="text-sm font-medium">{file.handler}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Last Updated:</span>
          <span className="text-sm font-medium">{file.lastUpdated}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Type:</span>
          <Badge variant="secondary">{file.type}</Badge>
        </div>
        {file.client && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Client:</span>
            <span className="text-sm font-medium">{file.client}</span>
          </div>
        )}
        {file.description && (
          <div className="pt-2">
            <span className="text-sm text-muted-foreground">Description:</span>
            <p className="text-sm mt-1">{file.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Case Files</h1>
          <p className="text-muted-foreground">Manage court files and general legal documents</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} className="bg-mna-navy hover:bg-mna-navy/90">
              <Plus size={16} className="mr-2" />
              New File
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingFile ? 'Edit Case File' : 'Create New Case File'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">File Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Enter file title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {fileTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="handler">Handler</Label>
                <Select value={formData.handler} onValueChange={(value) => setFormData({...formData, handler: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select handler" />
                  </SelectTrigger>
                  <SelectContent>
                    {handlers.map((handler) => (
                      <SelectItem key={handler} value={handler}>{handler}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="client">Client (Optional)</Label>
                <Input
                  id="client"
                  value={formData.client}
                  onChange={(e) => setFormData({...formData, client: e.target.value})}
                  placeholder="Enter client name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter file description"
                  className="h-20"
                />
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={editingFile ? handleEditFile : handleAddFile}
                  className="flex-1"
                >
                  {editingFile ? 'Update' : 'Create'} File
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Files</TabsTrigger>
          <TabsTrigger value="court">Court Files</TabsTrigger>
          <TabsTrigger value="general">General Files</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {files.map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="court" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {courtFiles.map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {generalFiles.map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Files;
