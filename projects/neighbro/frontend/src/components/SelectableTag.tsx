interface SelectableTagProps extends React.ComponentProps<"input"> {
  text: string;
}

export default function SelectableTag({ text, ...props }: SelectableTagProps) {
  return (
    <label className="radial grid grid-cols-[auto_1fr] place-items-center gap-1 rounded-full border-2 border-white/40 bg-black/39 px-2.5 py-1.25 shadow-sm outline-blue-500 focus-within:outline-2 has-checked:bg-neighbro-radial-full">
      <input type="checkbox" {...props} className="peer sr-only focus:outline-none" />
      <AddIcon className="peer-checked:hidden" />
      <span className="text-nowrap text-lg text-white">{text}</span>
    </label>
  );
}

const AddIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" height="13" viewBox="0 0 13 13" width="13" xmlns="http://www.w3.org/2000/svg">
    <title>Add</title>
    <g clipPath="url(#clip0_1527_2162)">
      <path
        d="M4.98002 4.99567V1.60984C4.98002 1.13608 5.11099 0.751224 5.37271 0.455161C5.63442 0.15172 6.00829 0 6.49433 0C6.98037 0 7.35424 0.15172 7.61596 0.455161C7.88524 0.751224 8.01989 1.13608 8.01989 1.60974V4.99557H11.396C11.8894 4.99557 12.2784 5.12883 12.5623 5.39537C12.8541 5.6544 13 6.02082 13 6.49439C13 6.97545 12.8541 7.34913 12.5623 7.61566C12.2784 7.88219 11.8894 8.01522 11.396 8.01522H8.01989V11.3902C8.01989 11.8712 7.88524 12.2599 7.61596 12.5559C7.34691 12.852 6.97279 13 6.49433 13C6.01587 13 5.64199 12.852 5.37271 12.5559C5.11099 12.2599 4.98002 11.8712 4.98002 11.3902V8.01522H1.6039C1.12539 8.01522 0.736558 7.87107 0.437434 7.58229C0.145811 7.28625 0 6.92369 0 6.49439C0 6.02082 0.142073 5.6544 0.426217 5.39537C0.717864 5.12883 1.11043 4.99557 1.60395 4.99557L4.98002 4.99567Z"
        fill="white"
        fillOpacity="0.9"
      />
    </g>
    <defs>
      <clipPath id="clip0_1527_2162">
        <rect fill="white" height="13" width="13" />
      </clipPath>
    </defs>
  </svg>
);
