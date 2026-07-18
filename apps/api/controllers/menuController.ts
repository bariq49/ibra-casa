import { Request, Response } from "express";
import { Menu } from "../models/menuModel.js";

export const getMenus = async (req: Request, res: Response) => {
  try {
    const menus = await Menu.find().sort({ order: 1 });
    res.json(menus);
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch menus", error });
  }
};

export const getMenusPublic = async (req: Request, res: Response) => {
  try {
    const menus = await Menu.find({ isActive: true }).sort({ order: 1 });
    res.json(menus);
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch menus", error });
  }
};

export const createMenu = async (req: Request, res: Response) => {
  try {
    const lastMenu = await Menu.findOne().sort({ order: -1 });
    const order = lastMenu ? lastMenu.order + 1 : 0;

    const newMenu = new Menu({
      ...req.body,
      order: req.body.order !== undefined ? req.body.order : order,
    });

    await newMenu.save();
    res.status(201).json(newMenu);
  } catch (error: any) {
    res.status(500).json({ message: "Failed to create menu", error });
  }
};

export const updateMenu = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedMenu = await Menu.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedMenu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    res.json(updatedMenu);
  } catch (error: any) {
    res.status(500).json({ message: "Failed to update menu", error });
  }
};

export const deleteMenu = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedMenu = await Menu.findByIdAndDelete(id);

    if (!deletedMenu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    res.json({ message: "Menu deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to delete menu", error });
  }
};

// Toggle active status
export const toggleMenuStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const menu = await Menu.findById(id);

    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    menu.isActive = !menu.isActive;
    await menu.save();

    res.json(menu);
  } catch (error: any) {
    res.status(500).json({ message: "Failed to toggle menu status", error });
  }
};

// Reorder menus
export const reorderMenus = async (req: Request, res: Response) => {
  try {
    const { menus } = req.body; // Expect array of { _id, order }

    if (!Array.isArray(menus)) {
      return res.status(400).json({ message: "Invalid data format" });
    }

    const updates = menus.map((item) =>
      Menu.findByIdAndUpdate(item._id, { order: item.order }),
    );

    await Promise.all(updates);

    res.json({ message: "Menus reordered successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to reorder menus", error });
  }
};
