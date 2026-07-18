"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Ruler } from "lucide-react";

interface SizeChartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
}

const SizeChartSidebar = ({ isOpen, onClose, category = "General" }: SizeChartSidebarProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2 font-Urbanist text-2xl">
            <Ruler className="size-6 text-primary" />
            Size Guide
          </SheetTitle>
          <SheetDescription>
            Use this guide to find your perfect fit. Measurements may vary slightly depending on the style and fabric.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-8">
          {/* Main Size Table */}
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead className="font-semibold text-foreground">Size</TableHead>
                  <TableHead className="font-semibold text-foreground">Chest (in)</TableHead>
                  <TableHead className="font-semibold text-foreground">Waist (in)</TableHead>
                  <TableHead className="font-semibold text-foreground">Hips (in)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { size: "S", chest: "34-36", waist: "28-30", hips: "35-37" },
                  { size: "M", chest: "38-40", waist: "32-34", hips: "39-41" },
                  { size: "L", chest: "42-44", waist: "36-38", hips: "43-45" },
                  { size: "XL", chest: "46-48", waist: "40-42", hips: "47-49" },
                  { size: "2XL", chest: "50-52", waist: "44-46", hips: "51-53" },
                ].map((row) => (
                  <TableRow key={row.size}>
                    <TableCell className="font-medium">{row.size}</TableCell>
                    <TableCell>{row.chest}</TableCell>
                    <TableCell>{row.waist}</TableCell>
                    <TableCell>{row.hips}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* How to Measure Section */}
          <div className="bg-muted/30 p-4 rounded-xl flex flex-col gap-4">
            <h4 className="font-urbanist font-semibold text-lg text-foreground">How to Measure</h4>
            
            <div className="flex flex-col gap-3">
              <div>
                <span className="font-semibold text-sm text-foreground">1. Chest: </span>
                <span className="text-sm text-muted-foreground">Measure under arms around the fullest part of the chest. Be sure to keep tape level across back and comfortably loose.</span>
              </div>
              <div>
                <span className="font-semibold text-sm text-foreground">2. Waist: </span>
                <span className="text-sm text-muted-foreground">Measure around natural waist with a measuring tape.</span>
              </div>
              <div>
                <span className="font-semibold text-sm text-foreground">3. Hips: </span>
                <span className="text-sm text-muted-foreground">Measure around the fullest part of the body at the top of legs.</span>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SizeChartSidebar;
