import type { MatTabHeaderPosition } from '@angular/material/tabs';

export type TabAlignment = 'start' | 'center' | 'end';

export interface TabsProps {
  dynamicHeight?: boolean;
  headerPosition?: MatTabHeaderPosition;
  alignTabs?: TabAlignment;
  disableStretchTabs?: boolean;
  fitInkBarToContent?: boolean;
  preserveContent?: boolean;
}
