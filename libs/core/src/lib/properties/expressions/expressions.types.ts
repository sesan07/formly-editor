export interface Expression {
  key: string;
  value: string;
}

export interface ExpressionDialogData {
  key: string;
  value: string;
  saveCallback: (key: string, value: string) => void;
}
