export function CancelButton({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <div
      className={`m-0 box-border flex h-[55px] w-[121.33px] items-center items-center justify-center justify-center justify-items-center rounded-[50px] border-[#f7d8f489] border-[5px] bg-gradient-to-r from-[#f525d2] to-[#fa3737] font-medium text-[20px] text-white tracking-[-0.011em] transition-all duration-100 ease-linear hover:scale-[1.02] hover:brightness-110 ${className || ""}`}
    >
      <img alt="cancle" className="mt-0.5 h-[16px]" src="/x.svg" />
      <button className="cursor-pointer px-1 py-2 text-white" {...props}>
        {children}
      </button>
    </div>
  );
}
