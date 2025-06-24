// DialogType Enum
export enum DialogType {
  DialogA = 'dialogA',
  DialogB = 'dialogB',
}

// 各 Dialog 專屬資料型別
export interface DialogAData {
  message: string;
  count: number;
}
export interface DialogBData {
  value: number;
  extra: string;
}

// Dialog 資料型別對應表
export type DialogDataMap = {
  [DialogType.DialogA]: DialogAData;
  [DialogType.DialogB]: DialogBData;
};

// Dialog 共用 props
export interface BaseDialogProps<T> {
  isOpen: boolean;
  data?: T;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

// Dialog 狀態型別
export interface DialogState<T = unknown> {
  isOpen: boolean;
  data?: T;
  isLoading?: boolean;
  onSubmit?: (data: T) => void;
  onClose?: () => void;
}

// 所有 Dialog 狀態
export type DialogsState = {
  [K in DialogType]: DialogState<DialogDataMap[K]>;
};

export interface DialogProps<T = unknown> {
  dialogType: DialogType;
  isOpen: boolean;
  data?: T;
  isLoading?: boolean;
  onSubmit?: (data: T) => void;
  onClose?: () => void;
} 