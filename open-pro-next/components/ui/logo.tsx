import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      className="inline-flex shrink-0 items-center text-lg font-semibold tracking-tight text-white"
      aria-label="islaAPP"
    >
      <span className="text-indigo-300">isla</span>
      <span className="text-white">APP</span>
    </Link>
  );
}
