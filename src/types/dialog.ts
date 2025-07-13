// DialogType as const object
export const DialogType = {
  DialogA: 'dialogA',
  DialogB: 'dialogB',
  DialogC: 'dialogC', // 新增
} as const;

export type DialogType = typeof DialogType[keyof typeof DialogType];

// Dialog 共用 props
export interface BaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  abTypeName: string;
  isLoading?: boolean;
}

// Dialog 狀態型別

export interface DialogAProps extends BaseDialogProps {
  sourceName: string;
  sourceID: string;
  onCreate: (groupName: string) => void;
}
export interface DialogBProps extends BaseDialogProps {
  sourceName: string;
  onCreate: (groupName: string) => void;
}
export interface DialogCProps extends BaseDialogProps {
  onDelete: (isDelete: boolean) => void;
}

export type DialogsState = {
  'dialogA': DialogAProps;
  'dialogB': DialogBProps;
  'dialogC': DialogCProps;
}; 