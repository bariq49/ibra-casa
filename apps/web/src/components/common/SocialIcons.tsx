import Link from "next/link";
import { Facebook, Instagram, Linkedin, type LucideIcon } from "lucide-react";
import { APP_DEFAULTS } from "@/constants/app-defaults";

const SOCIAL_ICONS: Record<
  (typeof APP_DEFAULTS.footer.socialLinks)[number]["platform"],
  LucideIcon
> = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
};

const SocialIcons = () => {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-4">
      {APP_DEFAULTS.footer.socialLinks.map((link, index) => {
        const Icon = SOCIAL_ICONS[link.platform];
        return (
          <Link
            href={link.href}
            key={index}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center size-10 rounded-full bg-[rgba(145,158,171,0.16)] hover:bg-primary-foreground hover:text-primary hoverEffect"
          >
            <Icon className="w-5 h-5" />
          </Link>
        );
      })}
    </div>
  );
};

export default SocialIcons;
