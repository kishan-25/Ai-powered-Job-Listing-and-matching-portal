"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

const Toast = ({ message, type = "info", duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  if (!isVisible) return null;

  const getToastStyles = () => {
    switch (type) {
      case "success":
        return "bg-success/10 border-success/20 text-success";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle size={20} className="text-green-600" />;
      case "error":
        return <AlertCircle size={20} className="text-red-600" />;
      case "warning":
        return <AlertCircle size={20} className="text-yellow-600" />;
      default:
        return <Info size={20} className="text-blue-600" />;
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ${
        isExiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"
      }`}
    >
      <div
        className={`${getToastStyles()} border rounded-lg p-4 shadow-lg flex items-start space-x-3`}
      >
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

// Toast Container Component
export const ToastContainer = ({ toasts, removeToast }) => {
  // If no props provided, this component will be managed by useToast hook
  if (!toasts || !removeToast) {
    return null;
  }
  
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

// Global toast state
let globalToasts = [];
let globalSetToasts = null;

// Custom hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    globalSetToasts = setToasts;
    return () => {
      globalSetToasts = null;
    };
  }, []);

  const addToast = (message, type = "info", duration = 5000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };
    globalToasts = [...globalToasts, newToast];
    if (globalSetToasts) {
      globalSetToasts([...globalToasts]);
    }
  };

  const removeToast = (id) => {
    globalToasts = globalToasts.filter((toast) => toast.id !== id);
    if (globalSetToasts) {
      globalSetToasts([...globalToasts]);
    }
  };

  const showSuccess = (message, duration = 5000) => addToast(message, "success", duration);
  const showError = (message, duration = 5000) => addToast(message, "error", duration);
  const showWarning = (message, duration = 5000) => addToast(message, "warning", duration);
  const showInfo = (message, duration = 5000) => addToast(message, "info", duration);

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

// Standalone Toast Container that manages its own state
export const ToastProvider = ({ children }) => {
  const { toasts, removeToast } = useToast();

  return (
    <>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts && toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </>
  );
};

export default Toast;
