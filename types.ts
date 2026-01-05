
export interface PhotoState {
  originalUrl: string | null;
  editedUrl: string | null;
  isProcessing: boolean;
}

export enum ViewMode {
  EDITOR = 'editor',
  PREVIEW = 'preview'
}
