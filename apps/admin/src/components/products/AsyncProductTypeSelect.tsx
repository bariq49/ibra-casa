import { useState, useEffect, useCallback, useRef } from "react";
import { Check, ChevronsUpDown, Loader2, Search, X } from "lucide-react";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDebounce } from "../../hooks/use-debounce";
import { Badge } from "@/components/ui/badge";

interface ProductType {
  _id: string;
  title: string;
}

interface AsyncProductTypeSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  productBase: string; // The parent ProductBase ID to filter by
  disabled?: boolean;
}

export function AsyncProductTypeSelect({
  value,
  onChange,
  productBase,
  disabled = false,
}: AsyncProductTypeSelectProps) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [selectedItems, setSelectedItems] = useState<ProductType[]>([]);
  const axiosPrivate = useAxiosPrivate();
  const observerTarget = useRef<HTMLDivElement>(null);

  // Fetch selected titles initially if a value exists but we don't know the title
  useEffect(() => {
    if (!value || value.length === 0) {
      setSelectedItems([]);
      return;
    }

    const missingIds = value.filter(
      (id) => !selectedItems.find((item) => item._id === id),
    );

    if (missingIds.length > 0) {
      Promise.all(
        missingIds.map((id) =>
          axiosPrivate.get(`/product-types/${id}`).catch(() => null),
        ),
      ).then((responses) => {
        const newItems = responses
          .filter((res) => res && res.data)
          .map((res: any) => ({
            _id: res.data._id,
            title: res.data.title || res.data.name,
          }));

        setSelectedItems((prev) => {
          const combined = [...prev, ...newItems];
          const unique = Array.from(
            new Map(combined.map((item) => [item._id, item])).values(),
          );
          return unique.filter((item) => value.includes(item._id));
        });
      });
    } else {
      setSelectedItems((prev) =>
        prev.filter((item) => value.includes(item._id)),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, axiosPrivate]);

  const fetchOptions = useCallback(
    async (
      pageNum: number,
      search: string,
      base: string,
      resetOptions = false,
    ) => {
      if (!base) {
        setOptions([]);
        setHasMore(false);
        return;
      }

      setLoading(true);
      try {
        const { data } = await axiosPrivate.get("/product-types/admin", {
          params: {
            page: pageNum,
            perPage: 25,
            search: search,
            productBase: base,
          },
        });

        const newOptions = data.productTypes.map((pt: any) => ({
          _id: pt._id,
          title: pt.title || pt.name,
        }));

        if (resetOptions) {
          setOptions(newOptions);
        } else {
          setOptions((prev) => {
            const combined = [...prev, ...newOptions];
            const unique = Array.from(
              new Map(combined.map((item) => [item._id, item])).values(),
            );
            return unique;
          });
        }

        setHasMore(data.page < data.totalPages);
      } catch (error) {
        console.error("Error fetching product types", error);
      } finally {
        setLoading(false);
      }
    },
    [axiosPrivate],
  );

  // Reset and fetch when open state changes, or search/base changes
  useEffect(() => {
    if (open) {
      setPage(1);
      fetchOptions(1, debouncedSearch, productBase, true);
    }
  }, [debouncedSearch, productBase, open, fetchOptions]);

  // Intersercion Observer for infinite scrolling
  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchOptions(nextPage, debouncedSearch, productBase, false);
        }
      },
      { threshold: 1.0 },
    );

    observer.observe(target);
    return () => observer.unobserve(target);
  }, [hasMore, loading, page, debouncedSearch, productBase, fetchOptions]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || !productBase}
          className="w-full justify-between font-normal h-auto min-h-10"
        >
          {value && value.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {selectedItems.map((item) => (
                <Badge
                  key={item._id}
                  variant="secondary"
                  className="mr-1 mb-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(value.filter((id) => id !== item._id));
                  }}
                >
                  {item.title}
                  <X className="ml-1 h-3 w-3 inline-block cursor-pointer hover:bg-muted rounded-full" />
                </Badge>
              ))}
            </div>
          ) : (
            "Select product types"
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Search product types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div
          className="max-h-[300px] overflow-y-auto overscroll-contain p-1"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {options.length === 0 && !loading ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No product types found.
            </div>
          ) : (
            options.map((option) => (
              <div
                key={option._id}
                className={cn(
                  "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-hidden hover:bg-accent hover:text-accent-foreground",
                  value.includes(option._id)
                    ? "bg-accent text-accent-foreground"
                    : "",
                )}
                onClick={() => {
                  if (value.includes(option._id)) {
                    onChange(value.filter((id) => id !== option._id));
                  } else {
                    onChange([...value, option._id]);
                  }
                }}
              >
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                  {value.includes(option._id) && <Check className="h-4 w-4" />}
                </span>
                {option.title}
              </div>
            ))
          )}

          {loading && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}

          <div ref={observerTarget} className="h-1" />
        </div>
      </PopoverContent>
    </Popover>
  );
}
