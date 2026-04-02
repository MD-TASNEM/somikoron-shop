'use client';

import { useState, useEffect } from 'react';
import { X, Phone, MessageCircle } from 'lucide-react';import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  // Check localStorage on mount
  useEffect(() => {
    const closed = localStorage.getItem('announcement-closed');
    if (closed === 'true') {
      setIsVisible(false);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('announcement-closed', 'true');
  };

  if (!isVisible) {
    return null;
  }

  return (/*#__PURE__*/
    _jsx("div", { className: "fixed top-0 left-0 right-0 z-50 bg-secondary text-white", children: /*#__PURE__*/
      _jsx("div", { className: "container mx-auto px-4 py-2", children: /*#__PURE__*/
        _jsxs("div", { className: "flex items-center justify-between", children: [/*#__PURE__*/

          _jsxs("div", { className: "flex items-center space-x-4 text-sm md:text-base", children: [/*#__PURE__*/

            _jsx("span", { className: "font-medium hidden sm:inline", children: "\u09B8\u09AE\u09C0\u0995\u09B0\u09A3 \u09B6\u09AA\u09C7 \u0986\u09AA\u09A8\u09BE\u0995\u09C7 \u09B8\u09CD\u09AC\u09BE\u0997\u09A4\u09AE\u0964" }

            ), /*#__PURE__*/


            _jsx("span", { className: "text-gray-300 hidden sm:inline", children: "|" }), /*#__PURE__*/


            _jsxs("div", { className: "flex items-center space-x-2", children: [/*#__PURE__*/
              _jsx(MessageCircle, { className: "h-4 w-4" }), /*#__PURE__*/
              _jsx("span", { className: "font-medium", children: "WhatsApp: +880 1996-570203" }

              )] }
            ), /*#__PURE__*/


            _jsx("span", { className: "text-gray-300", children: "|" }), /*#__PURE__*/


            _jsxs("div", { className: "flex items-center space-x-2", children: [/*#__PURE__*/
              _jsx(Phone, { className: "h-4 w-4" }), /*#__PURE__*/
              _jsx("span", { className: "font-medium", children: "\u09B9\u099F\u09B2\u09BE\u0987\u09A8: 01996-570203" }

              )] }
            )] }
          ), /*#__PURE__*/


          _jsx("button", {
            onClick: handleClose,
            className: "text-white hover:text-gray-200 transition-colors duration-200 p-1 rounded-full hover:bg-white/10",
            "aria-label": "Close announcement", children: /*#__PURE__*/

            _jsx(X, { className: "h-5 w-5" }) }
          )] }
        ) }
      ) }
    ));

}