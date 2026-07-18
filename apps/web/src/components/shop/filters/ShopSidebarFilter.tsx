"use client";
import React, { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { CATEGORY_ENDPOINTS, PRODUCT_TYPE_ENDPOINTS, COLOR_ENDPOINTS, SIZE_ENDPOINTS, WEIGHT_ENDPOINTS } from "@/constants/endpoints";
import { FilterState } from "../ShopLayoutEngine";
import { Slider } from "@/components/ui/slider";
import { useStoreCurrencySymbol } from "@/hooks/useStorePricing";

interface ShopSidebarFilterProps {
  filters?: FilterState;
  onFilterChange?: (newFilters: Partial<FilterState>) => void;
}

export default function ShopSidebarFilter({
  filters = {},
  onFilterChange,
}: ShopSidebarFilterProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [productTypes, setProductTypes] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
  const [weights, setWeights] = useState<any[]>([]);
  const [isLoadingCats, setIsLoadingCats] = useState(true);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);
  const [isLoadingBrands, setIsLoadingBrands] = useState(true);
  const [isLoadingColors, setIsLoadingColors] = useState(true);
  const [isLoadingSizes, setIsLoadingSizes] = useState(true);
  const [isLoadingWeights, setIsLoadingWeights] = useState(true);
  const currencySymbol = useStoreCurrencySymbol();

  // Search states
  const [categorySearch, setCategorySearch] = useState("");
  const [typeSearch, setTypeSearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");
  
  // Local state for price range
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.priceMin || 0,
    filters.priceMax || 1000,
  ]);

  useEffect(() => {
    if (filters.priceMin !== undefined && filters.priceMax !== undefined) {
      setPriceRange([filters.priceMin, filters.priceMax]);
    } else {
      setPriceRange([0, 100]); // Default based on Figma design
    }
  }, [filters.priceMin, filters.priceMax]);


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get(CATEGORY_ENDPOINTS.TREE);
        if (Array.isArray(res.data)) setCategories(res.data);
      } catch (err) {
        console.error("Failed to fetch categories filters", err);
      } finally {
        setIsLoadingCats(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const res = await api.get(PRODUCT_TYPE_ENDPOINTS.BASE);
        if (Array.isArray(res.data)) setProductTypes(res.data);
      } catch (err) {
        console.error("Failed to fetch product types filters", err);
      } finally {
        setIsLoadingTypes(false);
      }
    };
    fetchProductTypes();
  }, []);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await api.get("/api/brands");
        if (Array.isArray(res.data)) setBrands(res.data);
      } catch (err) {
        console.error("Failed to fetch brands", err);
      } finally {
        setIsLoadingBrands(false);
      }
    };
    fetchBrands();
  }, []);

  useEffect(() => {
    const fetchColors = async () => {
      try {
        const res = await api.get(COLOR_ENDPOINTS.BASE);
        if (Array.isArray(res.data)) setColors(res.data);
      } catch (err) {
        console.error("Failed to fetch colors", err);
      } finally {
        setIsLoadingColors(false);
      }
    };
    fetchColors();
  }, []);

  useEffect(() => {
    const fetchSizes = async () => {
      try {
        const res = await api.get(SIZE_ENDPOINTS.BASE);
        if (Array.isArray(res.data)) setSizes(res.data);
      } catch (err) {
        console.error("Failed to fetch sizes", err);
      } finally {
        setIsLoadingSizes(false);
      }
    };
    fetchSizes();
  }, []);

  useEffect(() => {
    const fetchWeights = async () => {
      try {
        const res = await api.get(WEIGHT_ENDPOINTS.BASE);
        if (Array.isArray(res.data)) setWeights(res.data);
      } catch (err) {
        console.error("Failed to fetch weights", err);
      } finally {
        setIsLoadingWeights(false);
      }
    };
    fetchWeights();
  }, []);

  const handleCategorySelect = (categoryId: string) => {
    if (!onFilterChange) return;
    if (filters.category === categoryId) {
      onFilterChange({ category: undefined }); // toggle off
    } else {
      onFilterChange({ category: categoryId });
    }
  };

  const handleProductTypeToggle = (typeSlug: string) => {
    if (!onFilterChange) return;
    const currentTypes = filters.productTypes || [];
    const newTypes = currentTypes.includes(typeSlug)
      ? currentTypes.filter((s) => s !== typeSlug)
      : [...currentTypes, typeSlug];
    onFilterChange({ productTypes: newTypes });
  };

  const handleBrandToggle = (brandId: string) => {
    if (!onFilterChange) return;
    const currentBrands = filters.brands || [];
    const newBrands = currentBrands.includes(brandId)
      ? currentBrands.filter((id) => id !== brandId)
      : [...currentBrands, brandId];
    onFilterChange({ brands: newBrands });
  };

  const handleRatingSelect = (rating: number) => {
    if (!onFilterChange) return;
    if (filters.rating === rating) {
      onFilterChange({ rating: undefined });
    } else {
      onFilterChange({ rating });
    }
  };

  const handlePriceChangeCommitted = (value: number[]) => {
    setPriceRange([value[0], value[1]]);
    if (onFilterChange) {
      onFilterChange({ priceMin: value[0], priceMax: value[1] });
    }
  };


  const resetFilter = (key: keyof FilterState) => {
     if (onFilterChange) {
        onFilterChange({ [key]: undefined });
     }
  }

  const resetAllFilters = () => {
      if (onFilterChange) {
          onFilterChange({ 
            category: undefined,
            productTypes: undefined,
            priceMin: undefined, 
            priceMax: undefined, 
            brands: undefined, 
            rating: undefined,
            colors: undefined,
            sizes: undefined,
            discount: undefined,
            packSizes: undefined
          });
      }
  }

  const handleColorToggle = (colorSlug: string) => {
    if (!onFilterChange) return;
    const currentColors = filters.colors || [];
    const newColors = currentColors.includes(colorSlug)
      ? currentColors.filter((c) => c !== colorSlug)
      : [...currentColors, colorSlug];
    onFilterChange({ colors: newColors });
  };

  const handleSizeToggle = (sizeSlug: string) => {
    if (!onFilterChange) return;
    const currentSizes = filters.sizes || [];
    const newSizes = currentSizes.includes(sizeSlug)
      ? currentSizes.filter((s) => s !== sizeSlug)
      : [...currentSizes, sizeSlug];
    onFilterChange({ sizes: newSizes });
  };

  const handleDiscountToggle = (discount: string) => {
    if (!onFilterChange) return;
    const currentDiscounts = filters.discount || [];
    const newDiscounts = currentDiscounts.includes(discount)
      ? currentDiscounts.filter((d) => d !== discount)
      : [...currentDiscounts, discount];
    onFilterChange({ discount: newDiscounts });
  };

  const handleWeightToggle = (weightSlug: string) => {
    if (!onFilterChange) return;
    const currentWeights = filters.packSizes || [];
    const newWeights = currentWeights.includes(weightSlug)
      ? currentWeights.filter((w) => w !== weightSlug)
      : [...currentWeights, weightSlug];
    onFilterChange({ packSizes: newWeights });
  };

  return (
    <div className="border border-border border-solid flex flex-col items-start overflow-clip relative rounded-[16px] w-full bg-card">
      {/* Filters Header */}
      <div className="bg-light-bg flex gap-[10px] items-center justify-between px-[24px] py-[16px] shrink-0 w-full">
        <p className="font-Urbanist font-bold leading-[30px] text-light-primary-text text-[20px]">
          Filters
        </p>
        <button 
           onClick={resetAllFilters}
           className="font-dm-sans font-semibold leading-[26px] text-primary text-[16px] hover:opacity-80 transition-opacity"
        >
          Clear All
        </button>
      </div>

      <div className="flex flex-col items-start p-[24px] shrink-0 w-full gap-[32px]">
        {/* Category Section */}
        <div className="flex flex-col gap-[16px] items-start shrink-0 w-full">
          <div className="flex gap-[10px] items-center justify-between shrink-0 w-full">
            <p className="font-Urbanist font-bold leading-[28px] text-light-primary-text text-[18px]">
              Category
            </p>
            <button 
               onClick={() => resetFilter('category')}
               className="font-dm-sans font-normal leading-[24px] text-light-secondary-text text-[16px] text-right underline hover:text-primary transition-colors"
            >
              Reset
            </button>
          </div>
          
          <div className="border border-light-border border-solid h-[40px] relative rounded-[80px] shrink-0 w-full flex items-center px-3 bg-card">
             <Search className="w-5 h-5 text-muted-foreground mr-2 shrink-0" />
             <input 
                type="text" 
                placeholder="Search..." 
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="w-full bg-transparent outline-none border-none font-dm-sans text-[16px] text-light-primary-text placeholder:text-muted-foreground"
              />
          </div>

          <div className="flex flex-col gap-[8px] items-start shrink-0 w-full max-h-[280px] overflow-y-auto custom-scrollbar pr-2">
            {isLoadingCats ? (
              <div className="py-4 flex justify-center w-full">
                <Loader2 className="animate-spin size-4 text-muted-foreground" />
              </div>
            ) : categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">No categories</p>
            ) : (
                categories
                  .filter((cat) => cat.name?.toLowerCase().includes(categorySearch.toLowerCase()))
                  .map((cat: any) => (
                  <div key={cat.slug || cat._id} className="flex gap-[8px] h-[36px] items-center shrink-0 w-full group cursor-pointer" onClick={() => handleCategorySelect(cat.slug || cat._id)}>
                    <Checkbox
                       checked={filters.category === (cat.slug || cat._id)}
                       onCheckedChange={() => handleCategorySelect(cat.slug || cat._id)}
                       className="rounded-full size-5 border-light-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <p className="flex-1 font-dm-sans font-normal leading-[24px] text-light-primary-text text-[16px] group-hover:text-primary transition-colors">
                      {cat.name}
                    </p>
                    <p className="font-dm-sans font-normal leading-[24px] shrink-0 text-light-secondary-text text-[16px]">
                      ( {cat.productCount || 0} )
                    </p>
                  </div>
                ))
            )}
          </div>
        </div>

        <div className="h-px w-full bg-light-divider shrink-0" />

        {/* Product Type Section */}
        <div className="flex flex-col gap-[16px] items-start shrink-0 w-full">
          <div className="flex gap-[10px] items-center justify-between shrink-0 w-full">
            <p className="font-Urbanist font-bold leading-[28px] text-light-primary-text text-[18px]">
              Product Type
            </p>
            <button 
               onClick={() => resetFilter('productTypes')}
               className="font-dm-sans font-normal leading-[24px] text-light-secondary-text text-[16px] text-right underline hover:text-primary transition-colors"
            >
              Reset
            </button>
          </div>
          
          <div className="border border-light-border border-solid h-[40px] relative rounded-[80px] shrink-0 w-full flex items-center px-3 bg-card">
             <Search className="w-5 h-5 text-muted-foreground mr-2 shrink-0" />
             <input 
                type="text" 
                placeholder="Search types..." 
                value={typeSearch}
                onChange={(e) => setTypeSearch(e.target.value)}
                className="w-full bg-transparent outline-none border-none font-dm-sans text-[16px] text-light-primary-text placeholder:text-muted-foreground"
              />
          </div>

          <div className="flex flex-col gap-[8px] items-start shrink-0 w-full max-h-[280px] overflow-y-auto custom-scrollbar pr-2">
            {isLoadingTypes ? (
              <div className="py-4 flex justify-center w-full">
                <Loader2 className="animate-spin size-4 text-muted-foreground" />
              </div>
            ) : productTypes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No product types</p>
            ) : (
                productTypes
                  .filter((pt) => (pt.title || pt.name || "").toLowerCase().includes(typeSearch.toLowerCase()))
                  .map((pt: any) => {
                    const identifier = pt.slug || pt._id;
                    const checked = (filters.productTypes || []).includes(identifier);
                    return (
                      <div key={identifier} className="flex gap-[8px] h-[36px] items-center shrink-0 w-full group cursor-pointer" onClick={() => handleProductTypeToggle(identifier)}>
                        <Checkbox
                           checked={checked}
                           onCheckedChange={() => handleProductTypeToggle(identifier)}
                           className="rounded-full size-5 border-light-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <p className="flex-1 font-dm-sans font-normal leading-[24px] text-light-primary-text text-[16px] group-hover:text-primary transition-colors">
                          {pt.title || pt.name}
                        </p>
                      </div>
                    )
                  })
            )}
          </div>
        </div>

        <div className="h-px w-full bg-light-divider shrink-0" />

        {/* Price Range Section */}
        <div className="flex flex-col gap-[24px] items-start shrink-0 w-full">
          <div className="flex gap-[10px] items-center justify-between shrink-0 w-full">
            <p className="font-Urbanist font-bold leading-[28px] text-light-primary-text text-[18px]">
              Price Range
            </p>
            <button 
                onClick={() => { resetFilter('priceMin'); resetFilter('priceMax'); }}
                className="font-dm-sans font-normal leading-[24px] text-light-secondary-text text-[16px] text-right underline hover:text-primary transition-colors"
            >
              Reset
            </button>
          </div>
          
          <div className="px-2 w-full mt-2">
            <Slider
               defaultValue={[0, 100]}
               max={500}
               step={1}
               value={priceRange}
               onValueChange={(val) => setPriceRange([val[0], val[1]])}
               onValueCommit={handlePriceChangeCommitted}
               className="w-full"
            />
          </div>

          <div className="flex gap-[16px] items-center shrink-0 w-full">
            <div className="border border-light-border border-solid flex-1 h-[40px] relative rounded-[80px] flex items-center px-[12px] min-w-0 pr-0">
              <span className="font-dm-sans text-light-primary-text text-[14px] shrink-0 mr-1">{currencySymbol}</span>
               <input 
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => {
                     const val = Number(e.target.value);
                     setPriceRange([val, priceRange[1]]);
                  }}
                  onBlur={() => handlePriceChangeCommitted(priceRange)}
                  className="w-0 min-w-0 flex-1 bg-transparent outline-none border-none font-dm-sans text-[14px] text-light-primary-text appearance-none pr-2"
               />
            </div>
            <p className="font-dm-sans font-medium leading-[22px] shrink-0 text-muted-foreground text-[14px]">
              To
            </p>
            <div className="border border-light-border border-solid flex-1 h-[40px] relative rounded-[80px] flex items-center px-[12px] min-w-0 pr-0">
               <span className="font-dm-sans text-light-primary-text text-[14px] shrink-0 mr-1">{currencySymbol}</span>
               <input 
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => {
                     const val = Number(e.target.value);
                     setPriceRange([priceRange[0], val]);
                  }}
                  onBlur={() => handlePriceChangeCommitted(priceRange)}
                 className="w-0 min-w-0 flex-1 bg-transparent outline-none border-none font-dm-sans text-[14px] text-light-primary-text appearance-none pr-2"
               />
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-light-divider shrink-0" />

        {/* Rating Section */}
        <div className="flex flex-col gap-[16px] items-start shrink-0 w-full">
          <div className="flex gap-[10px] items-center justify-between shrink-0 w-full">
            <p className="font-Urbanist font-bold leading-[28px] text-light-primary-text text-[18px]">
              Rating
            </p>
            <button 
               onClick={() => resetFilter('rating')}
               className="font-dm-sans font-normal leading-[24px] text-light-secondary-text text-[16px] text-right underline hover:text-primary transition-colors"
            >
              Reset
            </button>
          </div>
          <div className="flex gap-[12px] items-start shrink-0 w-full flex-wrap pb-2">
             {[5, 4, 3, 2, 1].map((rating) => (
                <button
                   key={rating}
                   onClick={() => handleRatingSelect(rating)}
                   className={`border border-solid gap-[6px] h-[36px] items-center py-[6px] rounded-[80px] flex px-[16px] transition-colors ${
                      filters.rating === rating 
                        ? "border-primary bg-primary/5 text-primary" 
                        : "border-light-border hover:border-primary hover:bg-primary/5 text-light-primary-text"
                   }`}
                >
                   <span className="font-dm-sans font-semibold text-[16px] leading-[24px]">{rating}</span>
                   <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 text-warning fill-warning">
                       <path d="M10 14.5L4.12 18L5.64 11.2L0.420002 6.55L7.42 5.93L10 0L12.58 5.93L19.58 6.55L14.36 11.2L15.88 18L10 14.5Z" />
                   </svg>
                </button>
             ))}
          </div>
        </div>

        <div className="h-px w-full bg-light-divider shrink-0" />

        {/* Brands Section */}
        <div className="flex flex-col gap-[16px] items-start shrink-0 w-full">
          <div className="flex gap-[10px] items-center justify-between shrink-0 w-full">
            <p className="font-Urbanist font-bold leading-[28px] text-light-primary-text text-[18px]">
              Brand
            </p>
            <button 
                onClick={() => resetFilter('brands')}
                className="font-dm-sans font-normal leading-[24px] text-light-secondary-text text-[16px] text-right underline hover:text-primary transition-colors"
            >
              Reset
            </button>
          </div>
          
          <div className="border border-light-border border-solid h-[40px] relative rounded-[80px] shrink-0 w-full flex items-center px-3 bg-card">
             <Search className="w-5 h-5 text-muted-foreground mr-2 shrink-0" />
             <input 
                type="text" 
                placeholder="Search..." 
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                className="w-full bg-transparent outline-none border-none font-dm-sans text-[16px] text-light-primary-text placeholder:text-muted-foreground"
              />
          </div>

          <div className="flex flex-col gap-[8px] items-start shrink-0 w-full max-h-[280px] overflow-y-auto custom-scrollbar pr-2">
            {isLoadingBrands ? (
                <div className="py-4 flex justify-center w-full">
                    <Loader2 className="animate-spin size-4 text-muted-foreground" />
                </div>
            ) : brands.length === 0 ? (
                <p className="text-sm text-muted-foreground">No brands</p>
            ) : (
               brands
                 .filter((brand) => brand.name?.toLowerCase().includes(brandSearch.toLowerCase()))
                 .map((brand: any) => {
                  const brandIdOrSlug = brand.slug || brand._id;
                  const checked = (filters.brands || []).includes(brandIdOrSlug);
                  return (
                      <div key={brandIdOrSlug} className="flex gap-[8px] h-[36px] items-center shrink-0 w-full group cursor-pointer" onClick={() => handleBrandToggle(brandIdOrSlug)}>
                        <Checkbox
                           checked={checked}
                           onCheckedChange={() => handleBrandToggle(brandIdOrSlug)}
                           className="rounded-full size-5 border-light-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <p className="flex-1 font-dm-sans font-normal leading-[24px] text-light-primary-text text-[16px] group-hover:text-primary transition-colors">
                          {brand.name}
                        </p>
                        <p className="font-dm-sans font-normal leading-[24px] shrink-0 text-light-secondary-text text-[16px]">
                          ( {brand.productCount || Math.floor(Math.random() * 20) + 1} )
                        </p>
                      </div>
                  )
               })
            )}
          </div>
        </div>

        <div className="h-px w-full bg-light-divider shrink-0" />

        {/* Colors Section */}
        <div className="flex flex-col gap-[16px] items-start shrink-0 w-full">
          <div className="flex gap-[10px] items-center justify-between shrink-0 w-full">
            <p className="font-Urbanist font-bold leading-[28px] text-light-primary-text text-[18px]">Colors</p>
            <button
              onClick={() => resetFilter('colors')}
              className="font-dm-sans font-normal leading-[24px] text-light-secondary-text text-[16px] text-right underline hover:text-primary transition-colors"
            >
              Reset
            </button>
          </div>
          {isLoadingColors ? (
            <div className="py-2 flex justify-center w-full">
              <Loader2 className="animate-spin size-4 text-muted-foreground" />
            </div>
          ) : colors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No colors</p>
          ) : (
            <div className="flex gap-[12px] items-center shrink-0 w-full flex-wrap">
              {colors.map((color) => {
                const slug = color.slug || color._id;
                const isSelected = (filters.colors || []).includes(slug);
                const hex = color.value || "#ccc";
                return (
                  <button
                    key={slug}
                    type="button"
                    title={color.name}
                    onClick={() => handleColorToggle(slug)}
                    className={`size-[28px] rounded-full cursor-pointer flex items-center justify-center border-2 transition-all ${
                      isSelected
                        ? "ring-2 ring-primary ring-offset-2 border-primary"
                        : "border-light-border hover:border-primary"
                    }`}
                    style={{ backgroundColor: hex }}
                  >
                    {isSelected && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          )}
          {colors.length > 0 && (filters.colors || []).length > 0 && (
            <p className="text-xs text-muted-foreground font-dm-sans">
              {(filters.colors || [])
                .map((slug) => colors.find((c) => (c.slug || c._id) === slug)?.name || slug)
                .join(", ")}
            </p>
          )}
        </div>

        <div className="h-px w-full bg-light-divider shrink-0" />

        {/* Size Section */}
        <div className="flex flex-col gap-[16px] items-start shrink-0 w-full">
          <div className="flex gap-[10px] items-center justify-between shrink-0 w-full">
            <p className="font-Urbanist font-bold leading-[28px] text-light-primary-text text-[18px]">Size</p>
            <button
               onClick={() => resetFilter('sizes')}
               className="font-dm-sans font-normal leading-[24px] text-light-secondary-text text-[16px] text-right underline hover:text-primary transition-colors"
            >
              Reset
            </button>
          </div>
          {isLoadingSizes ? (
            <div className="py-2 flex justify-center w-full">
              <Loader2 className="animate-spin size-4 text-muted-foreground" />
            </div>
          ) : sizes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sizes</p>
          ) : (
            <div className="flex gap-[8px] flex-wrap items-center shrink-0 w-full">
              {sizes.map((size) => {
                const slug = size.slug || size._id;
                const isSelected = (filters.sizes || []).includes(slug);
                return (
                  <div
                    key={slug}
                    onClick={() => handleSizeToggle(slug)}
                    className={`rounded-full border px-[16px] py-[6px] cursor-pointer transition-colors text-[14px] font-dm-sans select-none
                      ${isSelected ? 'border-primary bg-primary/5 text-primary' : 'border-light-border hover:border-primary text-light-secondary-text'}
                    `}
                  >
                    {size.name}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="h-px w-full bg-light-divider shrink-0" />

        {/* Discount Section */}
        <div className="flex flex-col gap-[16px] items-start shrink-0 w-full">
          <div className="flex gap-[10px] items-center justify-between shrink-0 w-full">
            <p className="font-Urbanist font-bold leading-[28px] text-light-primary-text text-[18px]">Discount</p>
            <button
               onClick={() => resetFilter('discount')}
               className="font-dm-sans font-normal leading-[24px] text-light-secondary-text text-[16px] text-right underline hover:text-primary transition-colors"
            >
              Reset
            </button>
          </div>
          <div className="flex flex-col gap-[8px] items-start shrink-0 w-full">
            {[
              { label: 'upto 5%', count: 10, value: '0-5' },
              { label: '5% - 10%', count: 8, value: '5-10' },
              { label: '10% - 15%', count: 32, value: '10-15' },
              { label: '15% - 25%', count: 12, value: '15-25' },
              { label: 'More than 25%', count: 12, value: '25-' },
            ].map((d, i) => {
              const checked = (filters.discount || []).includes(d.value);
              return (
                <div
                  key={i}
                  className="flex gap-[8px] h-[36px] items-center shrink-0 w-full group cursor-pointer"
                  onClick={() => handleDiscountToggle(d.value)}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => handleDiscountToggle(d.value)}
                    className="rounded-[4px] size-5 border-light-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <p className="flex-1 font-dm-sans font-normal leading-[24px] text-light-primary-text text-[16px] group-hover:text-primary transition-colors">{d.label}</p>
                  <p className="font-dm-sans font-normal leading-[24px] shrink-0 text-light-secondary-text text-[16px]">( {d.count} )</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="h-px w-full bg-light-divider shrink-0" />

        {/* Weight Section */}
        <div className="flex flex-col gap-[16px] items-start shrink-0 w-full">
          <div className="flex gap-[10px] items-center justify-between shrink-0 w-full">
            <p className="font-Urbanist font-bold leading-[28px] text-light-primary-text text-[18px]">Weight</p>
            <button
               onClick={() => resetFilter('packSizes')}
               className="font-dm-sans font-normal leading-[24px] text-light-secondary-text text-[16px] text-right underline hover:text-primary transition-colors"
            >
              Reset
            </button>
          </div>
          {isLoadingWeights ? (
            <div className="py-2 flex justify-center w-full">
              <Loader2 className="animate-spin size-4 text-muted-foreground" />
            </div>
          ) : weights.length === 0 ? (
            <p className="text-sm text-muted-foreground">No weights</p>
          ) : (
            <div className="flex flex-col gap-[8px] items-start shrink-0 w-full pb-4">
              {weights.map((weight) => {
                const slug = weight.slug || weight._id;
                const checked = (filters.packSizes || []).includes(slug);
                return (
                  <div
                    key={slug}
                    className="flex gap-[8px] h-[36px] items-center shrink-0 w-full group cursor-pointer"
                    onClick={() => handleWeightToggle(slug)}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => handleWeightToggle(slug)}
                      className="rounded-[4px] size-5 border-light-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <p className="flex-1 font-dm-sans font-normal leading-[24px] text-light-primary-text text-[16px] group-hover:text-primary transition-colors">
                      {weight.name}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

