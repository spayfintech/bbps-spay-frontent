import { useState, useRef, useEffect } from "react";
import Bconnectlogo from "../images/bharatconnect.png";
import placeholderImg from "../images/Spaylogowhite.png";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faTimes } from "@fortawesome/free-solid-svg-icons";

export const ServicesModalWrapper = ({
  isOpen,
  onClose,
  renderFooter,
  renderMiddle,
  renderHeader,
  resetOnClose,
  headerBg = "bg-linear-to-r from-blue-900 to-cyan-500",
  headerTextColor = "text-white",
}) => {
  const modalRef = useRef();
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    if (resetOnClose) resetOnClose();
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 250);
  };

  const [isCentered, setIsCentered] = useState(false);
  useEffect(() => {
    if (!isOpen || !isCentered) return; // Only attach if modal is open and centered
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        handleClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, isCentered]);

  useEffect(() => {
    const checkHeight = () => {
      if (modalRef.current) {
        const modalHeight = modalRef.current.offsetHeight;
        const viewportHeight = window.innerHeight;
        setIsCentered(modalHeight < viewportHeight * 0.8);
      }
    };

    checkHeight();
    window.addEventListener("resize", checkHeight);

    return () => window.removeEventListener("resize", checkHeight);
  }, [isOpen, renderMiddle]);

  const outerClasses = isCentered
    ? "flex flex-col items-center justify-center" // Centered when short
    : "flex flex-col items-center py-10"; // Padded top when tall

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`absolute inset-0 z-50 overflow-y-auto bg-black/40 ${
        isClosing ? "animate-fade-out" : "animate-fade-in"
      } ${outerClasses}`}
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-4 transform ${
          isClosing ? "animate-fly-out" : "animate-fly-in"
        }`}
      >
        {/* Header */}

        <div
          className={`flex justify-between items-center px-4 py-4 ${headerBg} ${headerTextColor} rounded-t-lg`}
        >
          {/* <span className="font-semibold text-4xl">{title}</span> */}
          <img
            src={placeholderImg}
            alt="Spay Fintech"
            className="h-10 w-auto object-contain"
          />
          {renderHeader}
          {/* <button
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-white/20"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button> */}
          <img
            src={Bconnectlogo}
            alt="Spay Fintech"
            className="h-9 w-auto object-contain"
          />
        </div>

        {/* Body */}
        <div className="p-6">{renderMiddle}</div>

        {/* Footer */}
        <div className="py-3 px-4 border-t-2 border-gray-100">
          <div className="flex justify-end gap-2">
            {renderFooter && renderFooter(handleClose)}
          </div>
        </div>
      </div>
    </div>
  );
};
