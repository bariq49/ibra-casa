export interface NavItem {
  id?: number;
  _id?: string;
  title: string;
  href: string;
  subItems?: NavItem[];
  isMega?: boolean;
  megaData?: MegaMenuColumn[];
}

export interface MegaMenuColumn {
  id?: number;
  _id?: string;
  title: string;
  items: {
    id?: number;
    _id?: string;
    title: string;
    href: string;
  }[];
}

export const navData: NavItem[] = [
  {
    id: 1,
    title: "Home",
    href: "/",
  },
  {
    id: 2,
    title: "About Us",
    href: "/about",
  },
  {
    id: 3,
    title: "Shop",
    href: "/shop",
  },
  {
    id: 4,
    title: "Blog",
    href: "/blogs",
  },
  {
    id: 5,
    title: "Contact Us",
    href: "/contact",
  },
];
