/**
 *
 * @returns a styled input component, takes all standard input props
 */
export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={`block-14 w-xs max-w-full rounded-full border-4 border-white/40 bg-black/40 px-5 text-[16px] text-white backdrop-blur-xs ${className}`}
      {...props}
    />
  );
}
