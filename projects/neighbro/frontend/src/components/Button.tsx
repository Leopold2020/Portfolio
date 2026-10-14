const variants = {
  primary:
    "relative w-full  rounded-full bg-white text-black before:absolute before:inset-0 before:rounded-full before:bg-radial-[at_50%_75%] from-red-500 to-pink-400 before:p-[2px] before:content-[''] before:-z-10 [&>:not(:first-child)]:relative",
  secondary:
    "block-14 w-xs  box-border max-w-full  rounded-[50px] border-[#f7d8f489] border-[5px] bg-gradient-to-r from-[#f525d2] to-[#fa3737] text-[23px] text-white transition-all duration-100 ease-linear hover:scale-[1.02] hover:brightness-110",
  social:
    " px-3 py-1  rounded-[50px] text-sm  border-[#f7d8f489] border-[4px] bg-gradient-to-r from-[#f525d2] to-[#fa3737]    text-white transition-all duration-100 ease-linear hover:scale-[1.02] hover:brightness-110",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "social";
}

const Button = ({ children, variant = "primary", ...props }: ButtonProps) => {
  return (
    <button
      {...props}
      className={`hover:cursor-pointer ${variants[variant]} ${props.className ? props.className : ""}`}
    >
      {children}
    </button>
  );
};

export default Button;
