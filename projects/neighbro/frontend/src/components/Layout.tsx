/**
 * Provides the blurred background and some padding on the edges
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <img alt="" className="block-screen fixed top-0 left-0 w-screen object-cover" src="/assets/map.png" />
      <div className="pointer-events-none fixed inset-0 backdrop-blur-xs" />
      <div className="min-block-screen relative z-10 grid justify-center">
        <div className="inline-screen max-inline-md min-w-[375px] p-3">{children}</div>
      </div>
    </>
  );
}
