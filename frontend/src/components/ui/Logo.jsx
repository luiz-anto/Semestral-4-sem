export default function Logo({ size = "small" }) {
  return (
    <span
      className={
        size === "large"
          ? "relative inline-flex h-40 w-40 items-center justify-center overflow-hidden sm:h-48 sm:w-48"
          : "relative inline-flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden"
      }
    >
      <img
        src="/logo.png"
        alt="Logo KiloW"
        className="h-full w-full scale-[1.8] translate-x-[12%] translate-y-[5%] object-contain"
      />
    </span>
  );
}
