"use client";

import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { toastConfig, toastStyles } from "@/lib/toast";

export default function ToastProvider({ children }) {
  useEffect(() => {
    // Inject custom styles
    const styleElement = document.createElement("style");
    styleElement.textContent = toastStyles;
    document.head.appendChild(styleElement);

    // Cleanup
    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

  return (
    <>
      {children}
      <ToastContainer
        {...toastConfig}
        newestOnTop={false}
        rtl={false}
        pauseOnFocusLoss={true}
        limit={5}
        className="toast-container"
        toastClassName="toast-notification"
        progressClassName="toast-progress"
      />
    </>
  );
}
