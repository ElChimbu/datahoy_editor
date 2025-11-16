import { ApiResponse } from '@/types/page';

export interface ComponentRegistryItem {
  id: string;
  component_name: string; // unique, kebab-case
  display_name?: string;
  category?: string; // layout | content | media | etc.
  version?: string; // e.g., "1.0.0"
  deprecated?: boolean;
  definition?: {
    subElements?: Array<{
      id?: string;
      subelement_name: string;
      options?: Record<string, any>;
      href?: string;
    }>;
  };
  created_at?: string;
  updated_at?: string;
}

export type ComponentsListResponse = ApiResponse<ComponentRegistryItem[]>;
export type ComponentItemResponse = ApiResponse<ComponentRegistryItem>;
export type ManifestResponse = ApiResponse<string[]>;
