import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import WallPaints from "./pages/WallPaints";
import CeilingPaints from "./pages/CeilingPaints";
import FacadePaints from "./pages/FacadePaints";
import Primers from "./pages/Primers";
import DecorativeCoatings from "./pages/DecorativeCoatings";
import Tools from "./pages/Tools";
import Rollers from "./pages/Rollers";
import BrushesTools from "./pages/BrushesTools";
import SpatulasAccessories from "./pages/SpatulasAccessories";
import AdhesivesSealants from "./pages/AdhesivesSealants";
import PuttiesLeveling from "./pages/PuttiesLeveling";
import TintsThinners from "./pages/TintsThinners";
import PaintsCoatings from "./pages/PaintsCoatings";
import Waterproofing from "./pages/Waterproofing";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import Admin from "./pages/Admin";
import Orders from "./pages/Orders";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/paints-coatings" element={<PaintsCoatings />} />
              <Route path="/wall-paints" element={<WallPaints />} />
              <Route path="/ceiling-paints" element={<CeilingPaints />} />
              <Route path="/facade-paints" element={<FacadePaints />} />
              <Route path="/primers" element={<Primers />} />
              <Route path="/decorative-coatings" element={<DecorativeCoatings />} />
              <Route path="/waterproofing" element={<Waterproofing />} />
              <Route path="/adhesives-sealants" element={<AdhesivesSealants />} />
              <Route path="/putties-leveling" element={<PuttiesLeveling />} />
              <Route path="/tints-thinners" element={<TintsThinners />} />
              <Route path="/brushes-tools" element={<BrushesTools />} />
              <Route path="/rollers" element={<Rollers />} />
              <Route path="/spatulas-accessories" element={<SpatulasAccessories />} />
              <Route path="/tools" element={<Tools />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
