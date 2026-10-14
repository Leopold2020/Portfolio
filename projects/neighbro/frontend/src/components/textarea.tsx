export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={`h-32 w-xs max-w-full rounded-4xl border-4 border-white/40 bg-black/40 px-5 py-3 text-[16px] text-white backdrop-blur-xs ${className}`}
      {...props}
    />
  );
}
