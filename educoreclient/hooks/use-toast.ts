import { useEffect, useState } from "react";

export type AppToast = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
};

let _toasts: AppToast[] = [];
let _setToasts: ((t: AppToast[]) => void) | null = null;

export const toast = (t: Omit<AppToast, "id">) => {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const newToast: AppToast = { id, ...t };
  _toasts = [..._toasts, newToast];
  _setToasts?.(_toasts);
  return id;
};

export const useToast = () => {
  const [toasts, setToasts] = useState<AppToast[]>(_toasts);

  useEffect(() => {
    _setToasts = setToasts;
    return () => {
      if (_setToasts === setToasts) _setToasts = null;
    };
  }, [setToasts]);

  return { toasts, setToasts };
};

export default useToast;
