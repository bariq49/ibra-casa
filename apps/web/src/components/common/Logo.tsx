import { logo } from "@/images";
import Image from "next/image";
import Link from "next/link";
interface Props {
  href?: string;
  className?: string;
}
const Logo = ({ href = "/", className }: Props) => {
  return (
    <Link href={href}>
      <Image
        width={250}
        height={250}
        src={logo}
        alt="Logo"
        className={`w-44 h-auto object-contain ${className}`}
        loading="eager"
      />
    </Link>
  );
};

export default Logo;
