import { useDndMonitor } from '@dnd-kit/core';
import { ComponentType } from '@/types/page';

export interface DragData {
  type: 'palette' | 'component';
  componentType?: ComponentType;
  componentId?: string;
}

export function useDragAndDrop() {
  useDndMonitor({
    onDragStart(event) {
      // Optional: Add visual feedback
    },
    onDragOver(event) {
      // Optional: Add drop zone highlighting
    },
    onDragEnd(event) {
      // Optional: Add cleanup
    },
  });
}

