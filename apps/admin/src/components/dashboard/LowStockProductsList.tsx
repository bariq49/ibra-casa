import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PackageX, ArrowRight, ShoppingCart } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";

interface ProductData {
  _id: string;
  name: string;
  brand: { name: string } | string;
  category: { name: string } | string;
  price: number;
  stock: number;
  image: string;
}

export function LowStockProductsList() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState("10");
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();

  const handleProductClick = (product: ProductData) => {
    const params = new URLSearchParams({
      product: product._id,
      name: product.name,
      price: String(product.price),
      stock: String(product.stock),
    });
    navigate(`/dashboard/purchases/create?${params.toString()}`);
  };

  useEffect(() => {
    const fetchLowStock = async () => {
      setLoading(true);
      try {
        const response = await axiosPrivate.get(`/stats/low-stock?threshold=${threshold}&limit=10`);
        setProducts(response.data);
      } catch (error) {
        console.error("Failed to fetch low stock products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLowStock();
  }, [axiosPrivate, threshold]);

  return (
    <Card className="shadow-sm border-border overflow-hidden flex flex-col h-full">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 sm:py-5 border-b border-border/50 bg-error-lighter/20 gap-3 sm:gap-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-error-lighter text-error-main rounded-md">
            <PackageX size={18} />
          </div>
          <CardTitle className="text-lg font-bold text-grey-900">Low Stock Products</CardTitle>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select value={threshold} onValueChange={setThreshold}>
            <SelectTrigger className="w-[120px] h-8 text-xs font-semibold bg-white border-border">
              <SelectValue placeholder="Threshold" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">Alert &lt; 10</SelectItem>
              <SelectItem value="20">Alert &lt; 20</SelectItem>
              <SelectItem value="30">Alert &lt; 30</SelectItem>
              <SelectItem value="all">View All</SelectItem>
            </SelectContent>
          </Select>

          <Link to="/dashboard/purchases/dashboard">
            <Button variant="ghost" size="sm" className="text-error-main hover:text-error-dark hover:bg-error-lighter/50 text-xs font-semibold h-8 rounded-lg px-3 hidden sm:flex shrink-0">
              Manage Inventory <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0 grow flex flex-col">
        <ul className="divide-y divide-grey-100 flex-1">
          <AnimatePresence mode="popLayout">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <li key={`skeleton-${i}`} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:px-6 border-b border-border/50">
                  <div className="flex items-start lg:items-center gap-4 w-full lg:w-auto">
                    <Skeleton className="h-14 w-14 lg:h-12 lg:w-12 rounded-lg shrink-0" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-1/2 lg:w-32 mb-2" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between lg:justify-end gap-6 w-full lg:w-auto border-t border-border/40 lg:border-0 pt-3 lg:pt-0">
                    <div>
                      <Skeleton className="h-3 w-10 mb-1 lg:hidden" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </div>
                </li>
              ))
            ) : products.length === 0 ? (
              <li className="p-8 text-center text-grey-500 font-medium">
                No products are currently under the selected stock threshold.
              </li>
            ) : (
              products.map((product, i) => (
                <motion.li
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: i * 0.05 }}
                  key={product._id}
                  onClick={() => handleProductClick(product)}
                  className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-4 p-4 sm:px-6 hover:bg-warning-lighter/20 transition-colors cursor-pointer group"
                  title={`Create purchase for ${product.name}`}
                >
                  <div className="flex items-start lg:items-center gap-3 lg:gap-4 w-full lg:w-auto">
                    <div className="h-14 w-14 lg:h-12 lg:w-12 rounded-lg bg-grey-100 border border-grey-200 overflow-hidden shrink-0">
                      <img src={product.image || "https://ui-avatars.com/api/?name=Product&background=random"} alt={product.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-grey-900 line-clamp-1">{product.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {product.brand && (
                          <>
                            <span className="text-xs text-grey-500 font-medium">
                              {typeof product.brand === 'object' ? product.brand?.name : product.brand}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-grey-300"></span>
                          </>
                        )}
                        <span className="text-xs text-grey-500">
                          {typeof product.category === 'object' ? product.category?.name : product.category || "Uncategorized"}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between lg:justify-end gap-4 lg:gap-6 w-full lg:w-auto border-t border-border/40 lg:border-0 pt-3 lg:pt-0">
                    <div className="text-left lg:text-right">
                      <p className="text-[10px] text-grey-400 font-medium mb-0.5 uppercase tracking-wider block lg:hidden">Price</p>
                      <p className="text-sm font-semibold text-grey-900">{formatCurrency(product.price || 0)}</p>
                    </div>
                    
                    <div className="flex items-center gap-3 lg:gap-6">
                      <div className="flex flex-col items-end gap-1 min-w-[80px]">
                        <Badge
                          variant="outline"
                          className={`font-semibold px-2 py-0 border ${
                            product.stock === 0
                            ? 'bg-error-lighter text-error-dark border-error-main/20'
                            : 'bg-warning-lighter text-warning-dark border-warning-main/20'
                          }`}
                        >
                          {product.stock === 0 ? 'Out of Stock' : `${product.stock} left`}
                        </Badge>
                      </div>
                      
                      {/* Shop cart icon for quick purchase */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 bg-grey-50 lg:bg-transparent text-warning-dark hover:text-warning-darker hover:bg-warning-lighter/50 rounded-md shrink-0 border border-transparent lg:border-none hover:border-warning-main/20"
                          title="Restock product"
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.li>
              ))
            )}
          </AnimatePresence>
        </ul>
      </CardContent>
    </Card>
  );
}
