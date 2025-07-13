// DialogType as const object
export const DialogType = {
  DialogA: 'dialogA',
  DialogB: 'dialogB',
  DialogC: 'dialogC', // 新增
} as const;

export type DialogType = typeof DialogType[keyof typeof DialogType];

// 各 Dialog 專屬資料型別
export interface DialogAData {
  message: string;
  count: number;
}
export interface DialogBData {
  value: number;
  extra: string;
}

export interface DialogCData {
  abTypeName: string;
}

// Dialog 資料型別對應表
export type DialogDataMap = {
  [DialogType.DialogA]: DialogAData;
  [DialogType.DialogB]: DialogBData;
  [DialogType.DialogC]: DialogCData; // 新增
};

// Dialog 共用 props
export interface BaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  abTypeName: string;
  isLoading?: boolean;
}

// Dialog 狀態型別
export interface DialogState<T = unknown> {
  isOpen: boolean;
  data?: T;
  isLoading?: boolean;
  onSubmit?: (data: T) => void;
  onClose?: () => void;
}

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

export interface DialogProps<T = unknown> {
  dialogType: DialogType;
  isOpen: boolean;
  data?: T;
  isLoading?: boolean;
  onSubmit?: (data: T) => void;
  onClose?: () => void;
} 