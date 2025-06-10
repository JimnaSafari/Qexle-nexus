
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';

const Files = () => {
  const [files] = useState([
    { 
      id: 1, 
      title: 'Johnson vs. Smith - Contract Dispute', 
      type: 'Court', 
      status: 'Active',
      handler: 'Sarah Johnson',
      lastUpdated: '2024-06-10'
    },
    { 
      id: 2, 
      title: 'Peterson Estate Planning', 
      type: 'General', 
      status: 'Complete',
      handler: 'Michael Brown',
      lastUpdated: '2024-06-08'
    },
    { 
      id: 3, 
      title: 'Corporate Merger - TechCorp', 
      type: 'Court', 
      status: 'Pending',
      handler: 'Emily Davis',
      lastUpdated: '2024-06-09'
    },
    { 
      id: 4, 
      title: 'Wilson Family Trust', 
      type: 'General', 
      status: 'Active',
      handler: 'David Wilson',
      lastUpdated: '2024-06-10'
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'default';
      case 'Complete': return 'mna-success';
      case 'Pending': return 'mna-warning';
      default: return 'outline';
    }
  };

  const courtFiles = files.filter(file => file.type === 'Court');
  const generalFiles = files.filter(file => file.type === 'General');

  const FileCard = ({ file }: { file: any }) => (
    <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 animate-scale-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{file.title}</CardTitle>
          <Badge 
            variant="outline" 
            className={`border-${getStatusColor(file.status)} text-${getStatusColor(file.status)}`}
          >
            {file.status}
          </Badge>
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
        <Button className="bg-mna-navy hover:bg-mna-navy/90">
          <Plus size={16} className="mr-2" />
          New File
        </Button>
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
