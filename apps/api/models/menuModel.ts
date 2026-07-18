import mongoose, { Document, Schema } from "mongoose";

interface IMenuItem {
  title: string;
  href: string;
}

interface IMegaMenuColumn {
  title: string; // Column title (e.g., "SHOP GRID")
  items: IMenuItem[];
}

interface ISubItem {
  title: string;
  href: string;
  subItems?: ISubItem[]; // Recursive (for normal dropdowns)
}

export interface IMenu extends Document {
  title: string;
  href: string;
  order: number;
  isActive: boolean;
  isMega: boolean;
  subItems?: ISubItem[]; // Standard nested menu
  megaData?: IMegaMenuColumn[]; // Mega menu columns
  createdAt: Date;
  updatedAt: Date;
}

const MenuItemSchema = new Schema({
  title: { type: String, required: true },
  href: { type: String, required: true },
});

const MegaMenuColumnSchema = new Schema({
  title: { type: String, required: true },
  items: [MenuItemSchema],
});

// Recursive sub-item schema for standard dropdowns
const SubItemSchema = new Schema();
SubItemSchema.add({
  title: { type: String, required: true },
  href: { type: String, required: true },
  subItems: [SubItemSchema],
});

const MenuSchema = new Schema<IMenu>(
  {
    title: { type: String, required: true },
    href: { type: String, required: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isMega: { type: Boolean, default: false },
    subItems: [SubItemSchema],
    megaData: [MegaMenuColumnSchema],
  },
  {
    timestamps: true,
  },
);

export const Menu = mongoose.model<IMenu>("Menu", MenuSchema);
