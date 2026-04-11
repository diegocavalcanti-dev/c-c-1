import { useEffect } from "react";

export default function AdBanner() {
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.googletag) {
        window.googletag.cmd.push(function() {
          // Exibe o slot de anúncio
          googletag.display('div-gpt-ad-1');
        });
      }
    } catch (e) {
      console.error("Erro ao carregar anúncio GPT:", e);
    }
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center overflow-hidden my-6 bg-[#f7f7f7cb] md:bg-transparent py-4 md:py-0">
      <div className="w-full max-w-[1200px] flex justify-center">
        {/* Google Publisher Tag Ad Slot */}
        <div 
          id="div-gpt-ad-1" 
          className="flex justify-center"
          style={{ minHeight: '90px' }}
        />
      </div>
    </div>
  );
}
