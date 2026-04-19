import { useEffect } from "react";

export default function AdBanner() {
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.adsbygoogle) {
        // Processa apenas os anúncios que ainda não foram processados
        window.adsbygoogle.push({});
      }
    } catch (e) {
      // Silencia erros se o anúncio já foi processado
      // console.error("Erro ao carregar anúncio AdSense:", e);
    }
  }, []);

  return (
    /* Container: Fundo cinza apenas no Mobile (até 768px), transparente no Desktop */
    <div className="w-full flex flex-col items-center justify-center overflow-hidden my-6 bg-[#f7f7f7cb] md:bg-transparent py-4 md:py-0">
      {/* Rótulo "Publicidade" estilo portal (opcional, remova se não gostar) */}
      {/* <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2 md:hidden">
        Publicidade
      </span> */}

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
          /* 'rectangle' permite anúncios quadrados e retangulares, aumentando a competição */
          data-ad-format="rectangle"
          data-full-width-responsive="false"
        />
      </div>
    </div>
  );
}
