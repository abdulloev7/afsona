import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BrandPage from "./pages/BrandPage";
import Catalog from "./pages/Catalog";
import BrandsPage from "./pages/BrandsPage";
import AboutPage from "./pages/AboutPage";
import ContactsPage from "./pages/ContactsPage";
import TintingPage from "./pages/TintingPage";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import Admin from "./pages/Admin";
import Orders from "./pages/Orders";
import Product from "./pages/Product";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import Portfolio from "./pages/Portfolio";
import PortfolioDetail from "./pages/PortfolioDetail";
import CategoryPage from "./pages/CategoryPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/brands" element={<BrandsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contacts" element={<ContactsPage />} />
              <Route path="/tinting" element={<TintingPage />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/product/:id" element={<Product />} />
              <Route path="/brands/:slug" element={<BrandPage />} />
              <Route path="/paints-coatings" element={<CategoryPage />} />
              <Route path="/wall-paints" element={<CategoryPage />} />
              <Route path="/ceiling-paints" element={<CategoryPage />} />
              <Route path="/facade-paints" element={<CategoryPage />} />
              <Route path="/primers" element={<CategoryPage />} />
              <Route path="/decorative-coatings" element={<CategoryPage />} />
              <Route path="/waterproofing" element={<CategoryPage />} />
              <Route path="/adhesives-sealants" element={<CategoryPage />} />
              <Route path="/putties-leveling" element={<CategoryPage />} />
              <Route path="/tints-thinners" element={<CategoryPage />} />
              <Route path="/brushes-tools" element={<CategoryPage />} />
              <Route path="/rollers" element={<CategoryPage />} />
              <Route path="/spatulas-accessories" element={<CategoryPage />} />
              <Route path="/tools" element={<CategoryPage />} />
              <Route path="/news" element={<News />} />
              <Route path="/news/:slug" element={<NewsDetail />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/portfolio/:slug" element={<PortfolioDetail />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
