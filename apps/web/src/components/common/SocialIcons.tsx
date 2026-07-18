import Link from "next/link";
import { Facebook, Instagram, Linkedin } from "lucide-react";

const PinterestIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.63 7.9 6.44 9.35-.09-.79-.17-2.01.03-2.88.19-.82 1.25-5.3 1.25-5.3s-.32-.64-.32-1.58c0-1.48.86-2.59 1.93-2.59.91 0 1.35.68 1.35 1.5 0 .91-.58 2.28-.88 3.55-.26 1.05.53 1.9 1.56 1.9 1.88 0 3.32-1.98 3.32-4.84 0-2.53-1.82-4.31-4.42-4.31-3.02 0-4.79 2.26-4.79 4.6 0 .86.33 1.79.74 2.29.08.1.09.19.07.29-.07.29-.22.9-.25 1.02-.04.16-.14.19-.3.12-1.12-.53-1.83-2.21-1.83-3.56 0-2.89 2.1-5.55 6.07-5.55 3.19 0 5.67 2.27 5.67 5.31 0 3.17-2 5.72-4.77 5.72-.93 0-1.8-.48-2.1-.105l-.57 2.18c-.21.8-.59 1.8-.88 2.41 1.05.32 2.16.49 3.31.49 5.52 0 10-4.48 10-10S17.52 2 12 2z" />
  </svg>
);

const BehanceIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M8.7 13.91c0-2.61-1.39-3.87-3.95-3.87H1.54v9.64h3.33c2.51 0 3.83-1.43 3.83-4.14v-1.63zm-4.77 2.6H2.9v-3.79h1.03c1.7 0 2.27 1.01 2.27 1.88 0 1.25-.97 1.91-2.27 1.91zM7.18 8.04c.89 0 1.48.51 1.48 1.43v.81H4.49v-.8c0-.98.6-1.44 1.48-1.44H7.18zm4.31 1.15v2.33h-1.34V9.19h1.34zm6.65 1.8h-4.3c.12 1.3 1.03 1.76 2.01 1.76.71 0 1.33-.28 1.63-.78l1.32.74c-.58.91-1.69 1.41-2.94 1.41-2.07 0-3.41-1.41-3.41-3.44s1.39-3.47 3.39-3.47c2.16 0 3.36 1.43 3.36 3.3v.48zm-1.34-1.12c-.1-.81-.72-1.28-1.63-1.28-1.02 0-1.61.54-1.78 1.28h3.41zM11.64 5.92h5.16v1.34h-5.16V5.92z"/>
  </svg>
);

const socialLinks = [
  { icon: Facebook, href: "https://www.facebook.com/" },
  { icon: Instagram, href: "https://www.instagram.com/" },
  { icon: Linkedin, href: "https://www.linkedin.com/" },
  { icon: PinterestIcon, href: "https://www.pinterest.com/" },
  { icon: BehanceIcon, href: "https://www.behance.net/" },
];

const SocialIcons = () => {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-4">
      {socialLinks.map((link, index) => (
        <Link
          href={link.href}
          key={index}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center size-10 rounded-full bg-[rgba(145,158,171,0.16)] hover:bg-primary-foreground hover:text-primary hoverEffect"
        >
          <link.icon className="w-5 h-5" />
        </Link>
      ))}
    </div>
  );
};

export default SocialIcons;
