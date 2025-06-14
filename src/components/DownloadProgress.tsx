
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Download, CheckCircle, XCircle } from 'lucide-react';
import { DownloadProgress as DownloadProgressType } from '@/types/files';

interface DownloadProgressProps {
  downloads: DownloadProgressType[];
  onClose: () => void;
}

const DownloadProgress = ({ downloads, onClose }: DownloadProgressProps) => {
  if (downloads.length === 0) return null;

  const allCompleted = downloads.every(d => d.status === 'completed' || d.status === 'error');

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Download size={16} />
            Downloads
          </h3>
          {allCompleted && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          )}
        </div>
        
        <div className="space-y-3 max-h-40 overflow-y-auto">
          {downloads.map((download) => (
            <div key={download.fileId} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="truncate">File {download.fileId}</span>
                <div className="flex items-center gap-1">
                  {download.status === 'completed' && <CheckCircle size={14} className="text-green-500" />}
                  {download.status === 'error' && <XCircle size={14} className="text-red-500" />}
                  <span className="text-xs">
                    {download.status === 'completed' ? 'Complete' : 
                     download.status === 'error' ? 'Failed' : 
                     `${download.progress}%`}
                  </span>
                </div>
              </div>
              {download.status !== 'completed' && download.status !== 'error' && (
                <Progress value={download.progress} className="h-2" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DownloadProgress;
