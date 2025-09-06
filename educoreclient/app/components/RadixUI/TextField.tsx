import * as React from "react";

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const TextField: React.FC<TextFieldProps> = ({ label, ...props }) => (
  <div className="space-y-1">
    {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
    <input {...props} />
  </div>
);
