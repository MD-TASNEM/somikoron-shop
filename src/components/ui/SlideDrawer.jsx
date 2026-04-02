'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";



export default function SlideDrawer({ isOpen, onClose, children, title }) {
  const drawerRef = useRef(null);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      // Save original body overflow
      const originalOverflow = document.body.style.overflow;
      const originalPosition = document.body.style.position;

      // Lock body scroll
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${window.scrollY}px`;
      document.body.style.width = '100%';

      return () => {
        // Restore original body styles
        document.body.style.overflow = originalOverflow;
        document.body.style.position = originalPosition;
        document.body.style.top = '';
        document.body.style.width = '';

        // Restore scroll position
        window.scrollTo(0, parseInt(document.body.style.top || '0') * -1);
      };
    }

    return () => {

      // Cleanup function
    };}, [isOpen]);

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Handle click outside drawer
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
      drawerRef.current &&
      !drawerRef.current.contains(event.target) &&
      isOpen)
      {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (/*#__PURE__*/
    _jsxs(_Fragment, { children: [/*#__PURE__*/

      _jsx("div", {
        className: `fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 transition-all duration-300 ease-in-out ${
        isOpen ?
        'opacity-100 pointer-events-auto' :
        'opacity-0 pointer-events-none'}`,

        "aria-hidden": !isOpen, children: /*#__PURE__*/


        _jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-transparent" }) }
      ), /*#__PURE__*/


      _jsxs("div", {
        ref: drawerRef,
        className: `fixed top-0 left-0 h-full bg-white shadow-2xl z-50 transition-transform duration-300 ease-in-out ${
        isOpen ?
        'translate-x-0' :
        '-translate-x-full'}`,

        style: {
          width: '280px',
          maxWidth: '80vw'
        },
        "aria-hidden": !isOpen,
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": title ? 'drawer-title' : undefined, children: [


        (title || onClose) && /*#__PURE__*/
        _jsxs("div", { className: "flex items-center justify-between p-4 border-b border-medium-gray", children: [
          title && /*#__PURE__*/
          _jsx("h2", { id: "drawer-title", className: "text-lg font-semibold text-secondary", children:
            title }
          ),

          onClose && /*#__PURE__*/
          _jsx("button", {
            onClick: onClose,
            className: "p-2 rounded-md text-dark-gray hover:text-primary hover:bg-gray-100 transition-colors duration-200",
            "aria-label": "Close drawer", children: /*#__PURE__*/

            _jsx(X, { className: "h-5 w-5" }) }
          )] }

        ), /*#__PURE__*/



        _jsx("div", { className: "flex-1 overflow-y-auto", style: { height: 'calc(100% - 64px)' }, children: /*#__PURE__*/
          _jsx("div", { className: "p-4", children:
            children }
          ) }
        ), /*#__PURE__*/


        _jsx("div", { className: "p-4 border-t border-medium-gray bg-light-bg", children: /*#__PURE__*/
          _jsx("div", { className: "text-center text-sm text-dark-gray", children: "\xA9 2024 \u09B8\u09AE\u09C0\u0995\u09B0\u09A3 \u09B6\u09AA. All rights reserved." }

          ) }
        )] }
      )] }
    ));

}