export function CreateButton({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <div
      className={`rounded-[50px] border-[#f7d8f416] border-[5px] bg-gradient-to-r from-[#f525d2] to-[#fa3737] font-medium text-[20px] tracking-[-0.011em] transition-all duration-100 ease-linear hover:scale-[1.02] hover:brightness-110 ${className || ""}`}
    >
      <button
        className="flex h-[45px] w-[111.33px] cursor-pointer items-center justify-center rounded-full bg-white p-0 text-pink-400"
        {...props}
      >
        <img alt="check" className="mt-0.5 mr-1 h-[19px]" src="/check.svg" />
        {children}
      </button>
    </div>
  );
}
