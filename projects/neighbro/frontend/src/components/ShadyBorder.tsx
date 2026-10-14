import type { ReactNode } from "react";

const ShadyBorder = ({
  className,
  children,
  size,
  overlayClassname,
}: {
  className?: string;
  children?: ReactNode;
  size?: number;
  borderWidth?: number;
  overlayClassname?: string;
}) => {
  return (
    <div className={`relative ${className || ""}`} style={size ? { height: size, width: size } : undefined}>
      {children}
      {/* Overlay border using style attribute */}
      <div className={`pointer-events-none absolute inset-0 border-white/50 ${overlayClassname}`} />
    </div>
  );
};

export default ShadyBorder;
