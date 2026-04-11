import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { X } from "lucide-react";

export default function FloatingAdBanner() {
  const [location] = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  // Recarregar anúncio quando a rota muda
  useEffect(() => {
    setIsVisible(true);
    try {
      if (typeof window !== "undefined" && window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch (e) {
      // Silencia erros
    }
  }, [location]);

  // Mostrar banner flutuante apenas após scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible || !isScrolled) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg p-3">
      <div className="w-full max-w-[728px] flex items-center justify-between gap-4">
        {/* Anúncio flutuante */}
        <div className="flex-1 flex justify-center">
        <ins
          className="adsbygoogle"
          style={{
            display: "block",
            width: "100%",
          }}
          data-ad-client="ca-pub-9394428727340956"
          data-ad-slot="5479994367"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
        </div>

        {/* Botão de fechar */}
        <button
          onClick={() => setIsVisible(false)}
          className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Fechar anúncio"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
}
