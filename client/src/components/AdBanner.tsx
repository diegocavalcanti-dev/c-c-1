import { useEffect } from "react";
import { useLocation } from "wouter";

export default function AdBanner() {
  const [location] = useLocation();

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.adsbygoogle) {
        // Processa os anúncios quando o componente monta ou a rota muda
        window.adsbygoogle.push({});
      }
    } catch (e) {
      // Silencia erros se o anúncio já foi processado
      // console.error("Erro ao carregar anúncio AdSense:", e);
    }
  }, [location]); // Recarrega quando a rota muda

  return (
    /* Container: Fundo cinza apenas no Mobile (até 768px), transparente no Desktop */
    <div className="w-full flex flex-col items-center justify-center overflow-hidden my-6 bg-[#f7f7f7cb] md:bg-transparent py-4 md:py-0">
      <div className="w-full max-w-[1200px] flex justify-center">
        <ins
          className="adsbygoogle"
          style={{
            display: "block",
            width: "100%",
            height: "250px",
          }}
          data-ad-client="ca-pub-9394428727340956"
          data-ad-slot="8360438065"
          data-ad-format="rectangle"
          data-full-width-responsive="false"
        />
      </div>
    </div>
  );
}
