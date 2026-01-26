export type ReadmeStyle = 'modern' | 'simple' | 'professional';
export type FileType = 'md' | 'txt';

export interface CustomSection {
  id: string;
  title: string;
}

export interface ProjectDetails {
  name: string;
  description: string;
  techStack: string;
  features: string;
  style: ReadmeStyle;
  fileType: FileType;
  imageUrl?: string;
  customSections: CustomSection[];
  customPrompt: string;
}

export interface GeneratedContent {
  markdown: string;
}

export enum ViewMode {
  EDIT = 'EDIT',
  PREVIEW = 'PREVIEW'
}