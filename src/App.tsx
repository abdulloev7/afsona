import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import WallPaints from "./pages/WallPaints";
import CeilingPaints from "./pages/CeilingPaints";
import FacadePaints from "./pages/FacadePaints";
import Primers from "./pages/Primers";
import DecorativeCoatings from "./pages/DecorativeCoatings";
import Tools from "./pages/Tools";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/wall-paints" element={<WallPaints />} />
          <Route path="/ceiling-paints" element={<CeilingPaints />} />
          <Route path="/facade-paints" element={<FacadePaints />} />
          <Route path="/primers" element={<Primers />} />
          <Route path="/decorative-coatings" element={<DecorativeCoatings />} />
          <Route path="/tools" element={<Tools />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
