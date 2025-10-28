export interface SafetyDetail {
  key: string;
  label: string;
}
export interface CheckboxItemProps {
  detail: SafetyDetail;
  isChecked: boolean;
  onToggle: (key: string) => void;
  description?: string;
  onEditDescription?: () => void;
  themeColors?:any;
}
export interface CameraModalProps {
  visible: boolean;
  initialDescription: string;
  onClose: () => void;
  onContinue: (description: string) => void;
  themeColors?: any;
}
