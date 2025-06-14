
export interface CaseFile {
  id: number;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  uploadedBy: string;
  caseNumber: string;
}

export interface DownloadProgress {
  fileId: number;
  progress: number;
  status: 'pending' | 'downloading' | 'completed' | 'error';
}
