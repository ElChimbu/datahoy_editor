export type ComponentType = 
  | 'Hero'
  | 'ArticleCard'
  | 'ArticleList'
  | 'Section'
  | 'Text'
  | 'Image'
  | 'Container';

export interface ComponentProps {
  [key: string]: any;
}

export interface ComponentDefinition {
  type: ComponentType;
  id: string;
  props: ComponentProps;
  children?: ComponentDefinition[];
}

export interface PageMetadata {
  description?: string;
  keywords?: string[];
  ogImage?: string;
}

export interface PageDefinition {
  id: string;
  slug: string;
  title: string;
  metadata?: PageMetadata;
  components: ComponentDefinition[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

