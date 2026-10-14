export function GradientBorderButton({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <div
      className={`relative w-xs max-w-full rounded-full bg-radial-[at_50%_75%] from-red-500 to-pink-400 p-1 ${className || ""}`}
    >
      <button className={`w-full cursor-pointer rounded-full bg-white px-4 py-2 text-black`} {...props}>
        {children}
      </button>
    </div>
  );
}
