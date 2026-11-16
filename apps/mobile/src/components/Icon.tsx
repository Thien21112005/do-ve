import React from 'react';
import {
  Home,
  Ticket,
  Trophy,
  Bookmark,
  MoreHorizontal,
  Calendar,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Share2,
  Check,
  X,
  Info,
  SlidersHorizontal,
  Trash2,
  Upload,
  Download,
  Table2,
  ListOrdered,
  ScanSearch,
  Clipboard,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react-native';

export const iconMap = {
  home: Home,
  ticket: Ticket,
  trophy: Trophy,
  bookmark: Bookmark,
  more: MoreHorizontal,
  calendar: Calendar,
  search: Search,
  checkCircle: CheckCircle2,
  alertCircle: AlertCircle,
  clock: Clock,
  refresh: RefreshCw,
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft,
  share: Share2,
  check: Check,
  x: X,
  info: Info,
  settings: SlidersHorizontal,
  trash: Trash2,
  upload: Upload,
  download: Download,
  table: Table2,
  listOrdered: ListOrdered,
  scanSearch: ScanSearch,
  clipboard: Clipboard,
} as const;

export type IconName = keyof typeof iconMap;

export interface IconProps extends LucideProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function Icon({
  name,
  size = 24,
  color = '#0f172a',
  strokeWidth = 2,
  ...rest
}: IconProps) {
  const Component: LucideIcon = iconMap[name] ?? MoreHorizontal;
  return (
    <Component size={size} color={color} strokeWidth={strokeWidth} {...rest} />
  );
}
