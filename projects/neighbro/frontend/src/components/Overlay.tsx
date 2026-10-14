import type React from "react";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ShadyBorder from "./ShadyBorder";

interface OverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  isForm?: boolean;
  initialVisiblePercentage?: number; // How much is initially visible (0-100)
  snapBack?: boolean; // Whether to snap to positions
  minVisibleHeight?: number; // Minimum visible height in pixels before closing
  setIsOpen?: () => void;
}

const Overlay: React.FC<OverlayProps> = ({
  isOpen,
  onClose,
  children,
  title,
  isForm = false,
  initialVisiblePercentage = 40,
  snapBack = false,
  minVisibleHeight = 150,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startYOffset, setStartYOffset] = useState(0);
  const [currentYOffset, setCurrentYOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [sheetHeight, setSheetHeight] = useState(0);
  const [initialOffset, setInitialOffset] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLButtonElement>(null);

  // Calculate the offset needed to show only the desired percentage
  const calculateInitialOffset = useCallback(
    (height: number) => {
      const visibleHeight = (initialVisiblePercentage / 100) * height;
      return height - visibleHeight;
    },
    [initialVisiblePercentage],
  );

  // Get current visible height of the sheet
  const getVisibleHeight = useCallback(() => {
    if (!sheetHeight) return 0;
    const visiblePixels = sheetHeight - Math.max(0, currentYOffset);
    return Math.max(0, visiblePixels);
  }, [sheetHeight, currentYOffset]);

  // Check if should close based on visibility
  const shouldCloseDueToVisibility = useCallback(() => {
    const visibleHeight = getVisibleHeight();
    return visibleHeight < minVisibleHeight;
  }, [getVisibleHeight, minVisibleHeight]);

  // Measure sheet height and set initial offset
  useEffect(() => {
    if (sheetRef.current && isVisible) {
      const height = sheetRef.current.scrollHeight;
      if (height !== sheetHeight) {
        setSheetHeight(height);
        const newOffset = calculateInitialOffset(height);
        setInitialOffset(newOffset);
        setCurrentYOffset(newOffset);
        sheetRef.current.style.transform = `translateY(${newOffset}px)`;
      }
    }
  }, [isVisible, sheetHeight, calculateInitialOffset]);

  // Update sheet position (move up/down on Y axis)
  const updateSheetPosition = useCallback(
    (yOffset: number, shouldAnimate: boolean = false) => {
      if (!sheetRef.current) return;

      // Define bounds
      const maxUpOffset = -100; // Can only go up 100px (negative = up)
      const maxDownOffset = sheetHeight * 0.5; // Can drag down to show 50% more

      // Clamp the offset
      let clampedOffset = Math.min(Math.max(yOffset, maxUpOffset), maxDownOffset);

      // Additional check: don't hide more than minVisibleHeight when dragging down
      if (clampedOffset > 0 && sheetHeight - clampedOffset < minVisibleHeight) {
        clampedOffset = sheetHeight - minVisibleHeight;
      }

      if (shouldAnimate) {
        sheetRef.current.style.transition = "transform 0.3s ease";
        sheetRef.current.style.transform = `translateY(${clampedOffset}px)`;
        setTimeout(() => {
          if (sheetRef.current && !isDragging) {
            sheetRef.current.style.transition = "";
          }
        }, 300);
      } else {
        sheetRef.current.style.transform = `translateY(${clampedOffset}px)`;
      }

      setCurrentYOffset(clampedOffset);

      // Check if we need to close immediately (only when not dragging)
      if (!isDragging && clampedOffset > 0 && shouldCloseDueToVisibility()) {
        onClose();
        return;
      }

      // Update backdrop opacity
      const visibleHeight = sheetHeight - Math.max(0, clampedOffset);
      const visibilityProgress = Math.min(1, Math.max(0, visibleHeight / sheetHeight));
      const backdrop = document.querySelector(".layover-backdrop");
      if (backdrop) {
        const opacity = 0.2 + visibilityProgress * 0.6;
        (backdrop as HTMLElement).style.opacity = opacity.toString();
      }
    },
    [sheetHeight, minVisibleHeight, isDragging, shouldCloseDueToVisibility, onClose],
  );

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => {
        setIsAnimating(true);
      }, 10);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isForm) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isForm, onClose]);

  // Prevent body scroll when layover is open
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisible]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isForm) return;

    // Only allow drag if scrolled to the top
    if (contentRef.current && contentRef.current.scrollTop > 0) {
      return;
    }

    const touch = e.touches[0];
    if (!touch) return;

    setStartY(touch.clientY);
    setStartYOffset(currentYOffset);
    setIsDragging(true);

    if (sheetRef.current) {
      sheetRef.current.style.transition = "none";
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || isForm || !sheetRef.current) return;

    const touch = e.touches[0];
    if (!touch) return;

    // Calculate delta (positive = moving down, negative = moving up)
    const deltaY = touch.clientY - startY;
    let newYOffset = startYOffset + deltaY;

    // Define bounds
    const maxUpOffset = -100;
    const maxDownOffset = sheetHeight * 0.5;

    // Clamp the new offset
    newYOffset = Math.min(Math.max(newYOffset, maxUpOffset), maxDownOffset);

    updateSheetPosition(newYOffset);
  };

  const handleTouchEnd = () => {
    if (isForm || !isDragging) {
      setIsDragging(false);
      return;
    }

    setIsDragging(false);

    // Calculate how far the sheet was dragged (positive = down, negative = up)
    const dragDistance = currentYOffset - startYOffset;

    // Check if we should close due to low visibility
    if (shouldCloseDueToVisibility()) {
      onClose();
      return;
    }

    // Check if dragged down more than 200px
    if (dragDistance > 200) {
      onClose();
      return;
    }

    if (snapBack) {
      // Snap back to initial position
      updateSheetPosition(initialOffset, true);
    } else {
      // Keep current position
      if (sheetRef.current) {
        sheetRef.current.style.transition = "transform 0.3s ease";
      }
    }
  };

  const handleDragStart = (e: React.MouseEvent | React.KeyboardEvent) => {
    if (isForm) return;

    // Only allow drag if scrolled to the top
    if (contentRef.current && contentRef.current.scrollTop > 0) {
      return;
    }

    e.preventDefault();

    if ("key" in e && e.key !== "Enter" && e.key !== " ") {
      return;
    }

    if ("clientY" in e) {
      setStartY(e.clientY);
      setStartYOffset(currentYOffset);
    } else {
      onClose();
      return;
    }

    setIsDragging(true);

    if (sheetRef.current) {
      sheetRef.current.style.transition = "none";
    }

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseEnd);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!sheetRef.current) return;

    const deltaY = e.clientY - startY;
    let newYOffset = startYOffset + deltaY;

    const maxUpOffset = -100;
    const maxDownOffset = sheetHeight * 0.5;

    newYOffset = Math.min(Math.max(newYOffset, maxUpOffset), maxDownOffset);

    updateSheetPosition(newYOffset);
  };

  const handleMouseEnd = () => {
    if (isForm || !isDragging) {
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseEnd);
      return;
    }

    setIsDragging(false);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseEnd);

    const dragDistance = currentYOffset - startYOffset;

    if (shouldCloseDueToVisibility()) {
      onClose();
      return;
    }

    if (dragDistance > 200) {
      onClose();
      return;
    }

    if (snapBack) {
      updateSheetPosition(initialOffset, true);
    } else {
      if (sheetRef.current) {
        sheetRef.current.style.transition = "transform 0.3s ease";
      }
    }
  };

  const handleBackdropClick = () => {
    if (!isForm) {
      onClose();
    }
  };

  const handleBackdropKeyDown = (e: React.KeyboardEvent) => {
    if (!isForm && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClose();
    }
  };

  const handleCloseButtonKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClose();
    }
  };

  if (!isVisible) return null;

  return createPortal(
    <div
      aria-label={!title ? "Modal dialog" : undefined}
      aria-labelledby={title ? "layover-title" : undefined}
      aria-modal="true"
      className={`fixed inset-0 z-1000 ${isAnimating ? "visible" : "invisible"}`}
      role="dialog"
    >
      {/* Backdrop */}
      <button
        aria-label="Close modal"
        className="layover-backdrop absolute inset-0 bg-black/50 transition-opacity duration-300"
        onClick={handleBackdropClick}
        onKeyDown={handleBackdropKeyDown}
        style={{ opacity: isAnimating ? 0.5 : 0 }}
        tabIndex={!isForm ? 0 : -1}
        type="button"
      />

      {/* Bottom Sheet */}
      <div
        className="absolute right-0 bottom-0 left-0 mx-auto flex w-[92%] max-w-88 flex-col rounded-4xl bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] will-change-transform"
        onMouseDown={handleDragStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        onTouchStart={handleTouchStart}
        ref={sheetRef}
        role="dialog"
        style={{
          bottom: 0,
          transform: `translateY(${isAnimating ? currentYOffset : "100%"})`,
          transition: isDragging ? "none" : "transform 0.3s ease",
        }}
      >
        {/* Drag Handle */}
        {!isForm && (
          <button
            aria-label="Drag up or down to resize, drag down to close"
            className="flex shrink-0 cursor-grab select-none justify-center py-3 pb-2 active:cursor-grabbing"
            onKeyDown={handleDragStart}
            onMouseDown={handleDragStart}
            ref={dragHandleRef}
            tabIndex={0}
            type="button"
          >
            <div aria-hidden="true" className="h-1 w-10 rounded-full bg-gray-300" />
          </button>
        )}

        {/* Header */}
        {(title || !isForm) && (
          <div className="flex shrink-0 items-center justify-between border-gray-100 border-b px-5 py-4">
            {title && (
              <h2 className="m-0 font-semibold text-gray-800 text-xl" id="layover-title">
                {title}
              </h2>
            )}
            {!isForm && (
              <button
                aria-label="Close modal"
                className="flex cursor-pointer items-center justify-center rounded border-none bg-none p-1 text-gray-500 transition-colors hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={onClose}
                onKeyDown={handleCloseButtonKeyDown}
                tabIndex={0}
                type="button"
              >
                <svg
                  aria-hidden="true"
                  fill="none"
                  height="24"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>Close</title>
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div
          className="flex-1"
          ref={contentRef}
          style={{
            overscrollBehavior: "contain",
          }}
        >
          <ShadyBorder overlayClassname="border-4 rounded-4xl">
            <div className="rounded-4xl bg-[#FF000FCC] shadow-md">
              <ShadyBorder overlayClassname="rounded-[30px] border-4 -bottom-1 top-0">
                <div className="rounded-4xl bg-white p-4">{children}</div>
              </ShadyBorder>
              <button
                className="flex w-full items-center justify-center gap-3 px-5 py-3 text-sm text-white"
                onClick={onClose}
                type="button"
              >
                <img alt="info-icon" className="text-white" src="/info.svg" />
                Swipe down or click here to close window
              </button>
            </div>
          </ShadyBorder>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default Overlay;
