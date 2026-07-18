import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertCircle, TrendingUp, DollarSign, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface InventoryStats {
  totalProducts: number;
  outOfStock: number;
  lowStock: number;
  totalValue: number;
  totalItems: number;
}

export function PurchaseDashboardPage() {
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    const fetchPurchaseStats = async () => {
      try {
        const response = await axiosPrivate.get("/stats/purchases");
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch purchase stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPurchaseStats();
  }, [axiosPrivate]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-grey-900">Purchase & Inventory Dashboard</h1>
        <p className="text-grey-500 text-sm">Comprehensive overview of stock status and purchasing needs</p>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {/* Card 1: Total Inventory */}
          <motion.div variants={itemVariants}>
            <Card className="hover:shadow-md transition-shadow border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-grey-500">
                  Total Managed Items
                </CardTitle>
                <div className="p-2 bg-primary-lighter text-primary-main rounded-md">
                  <Package className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                <p className="text-xs text-grey-500 mt-1">
                  Unique SKUs tracked across {stats.totalItems.toLocaleString()} total units
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 2: Low Stock Alerts */}
          <motion.div variants={itemVariants}>
            <Card className="hover:shadow-md transition-shadow border-warning-main/30 border-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-warning-main">
                  Low Stock Products
                </CardTitle>
                <div className="p-2 bg-warning-lighter text-warning-dark rounded-md">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.lowStock}</div>
                <p className="text-xs text-warning-dark mt-1">
                  Items requiring immediate reorder evaluation
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 3: Out of Stock */}
          <motion.div variants={itemVariants}>
            <Card className="hover:shadow-md transition-shadow border-error-main/30 border-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-error-main">
                  Out of Stock
                </CardTitle>
                <div className="p-2 bg-error-lighter text-error-dark rounded-md">
                  <AlertCircle className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.outOfStock}</div>
                <p className="text-xs text-error-dark mt-1">
                  Products currently losing potential sales
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 4: Action / Value */}
          <motion.div variants={itemVariants}>
            <Card className="hover:shadow-md transition-shadow border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-grey-500">
                  Total Inventory Value
                </CardTitle>
                <div className="p-2 bg-success-lighter text-success-main rounded-md">
                  <DollarSign className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
                <p className="text-xs text-grey-500 mt-1">
                  Gross estimated retail value
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <Card className="border-border/50 bg-linear-to-br from-primary-main/5 to-transparent">
          <CardHeader>
            <CardTitle className="text-lg">Need to Replenish?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-grey-500 mb-6">
              Create a new purchase order directly from pending inventory alerts to restock fast.
            </p>
            <Link to="/dashboard/purchases/create">
              <Button className="w-full">
                Create Purchase Order <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
