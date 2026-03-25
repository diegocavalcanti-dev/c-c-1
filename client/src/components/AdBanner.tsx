import { useEffect, useRef } from "react";

declare global {
  interface window {
    adsbygoogle: any[];
  }
}

export default function AdBanner() {
  const initialized = useRef(false);

  useEffect(() => {
    // Evita disparar o anúncio duas vezes no mesmo componente
    if (!initialized.current) {
      try {
        if (typeof window !== "undefined") {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          initialized.current = true;
        }
      } catch (e) {
        console.error("Erro ao carregar anúncio AdSense:", e);
      }
    }
  }, []);

  return (
    <div
      className="w-full flex justify-center overflow-hidden my-4"
      style={{ minHeight: "100px" }} // Evita que o layout "pule" quando o anúncio carregar
    >
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%" }}
        data-ad-client="ca-pub-9394428727340956"
        data-ad-slot="8360438065"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
