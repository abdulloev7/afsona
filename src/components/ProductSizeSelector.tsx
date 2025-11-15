import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Minus, Plus } from "lucide-react";

interface ProductSizeSelectorProps {
  product: {
    id: string;
    name: string;
    price: number;
    sizes?: string[] | null;
    size_variants?: { volume: string; price: number }[] | null;
  };
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (size: string, quantity: number) => void;
}

export const ProductSizeSelector = ({ product, isOpen, onClose, onAddToCart }: ProductSizeSelectorProps) => {
  // Use size_variants if available, otherwise fall back to sizes
  const volumes = product.size_variants?.map(v => v.volume) || product.sizes || [];
  const [selectedSize, setSelectedSize] = useState<string>(volumes[0] || "");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (isOpen) {
      const currentVolumes = product.size_variants?.map(v => v.volume) || product.sizes || [];
      setSelectedSize(currentVolumes[0] || "");
      setQuantity(1);
    }
  }, [isOpen, product.sizes, product.size_variants]);

  const handleSubmit = () => {
    if (selectedSize) {
      onAddToCart(selectedSize, quantity);
    }
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Выберите объем</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-2">{product.name}</h4>
            {product.size_variants ? (
              <p className="text-sm text-muted-foreground">
                {selectedSize && product.size_variants.find(v => v.volume === selectedSize)
                  ? `${product.size_variants.find(v => v.volume === selectedSize)?.price} сом.`
                  : 'Выберите объем'}
              </p>
            ) : (
              <p className="text-lg font-semibold text-primary">{product.price} сом.</p>
            )}
          </div>

          {((product.size_variants && product.size_variants.length > 0) || 
            (product.sizes && product.sizes.length > 0)) && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Доступные объемы:</Label>
              <RadioGroup value={selectedSize} onValueChange={setSelectedSize}>
                {product.size_variants ? (
                  product.size_variants.map((variant) => (
                    <div key={variant.volume} className="flex items-center justify-between space-x-2 p-2 hover:bg-accent rounded">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={variant.volume} id={`size-${variant.volume}`} />
                        <Label htmlFor={`size-${variant.volume}`} className="cursor-pointer font-normal">
                          {variant.volume}
                        </Label>
                      </div>
                      <span className="text-sm font-semibold text-primary">{variant.price} сом</span>
                    </div>
                  ))
                ) : (
                  product.sizes?.map((size) => (
                    <div key={size} className="flex items-center space-x-2">
                      <RadioGroupItem value={size} id={`size-${size}`} />
                      <Label htmlFor={`size-${size}`} className="cursor-pointer">
                        {size}
                      </Label>
                    </div>
                  ))
                )}
              </RadioGroup>
            </div>
          )}

          <div className="space-y-3">
            <Label className="text-sm font-medium">Количество:</Label>
            <div className="flex items-center space-x-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={incrementQuantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Отмена
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!selectedSize}
              className="flex-1"
            >
              Добавить в корзину
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
