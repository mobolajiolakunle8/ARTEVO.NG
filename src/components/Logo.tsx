import Link from "next/link";

interface LogoProps {
  variant?: "full" | "monogram" | "light";
  className?: string;
}

export default function Logo({ variant = "full", className = "" }: LogoProps) {
  if (variant === "monogram") {
    return (
      <Link href="/" className={`inline-flex items-center group ${className}`} aria-label="ARTÉVO Home">
        <img
          src="/logo/artevo-mark.svg"
          alt="ARTÉVO Monogram"
          className="h-9 w-9 rounded-sm shadow-md ring-1 ring-[#161616]/10 group-hover:ring-[#B5965A] transition-all"
        />
      </Link>
    );
  }

  const src = variant === "light" ? "/logo/artevo-full-light.svg" : "/logo/artevo-full.svg";

  return (
    <Link href="/" className={`inline-flex items-center group ${className}`} aria-label="ARTÉVO — Art. Evolved.">
      <img
        src={src}
        alt="ARTÉVO — Art. Evolved."
        className="h-11 w-auto transition-transform duration-300 group-hover:scale-[1.02]"
      />
    </Link>
  );
}
