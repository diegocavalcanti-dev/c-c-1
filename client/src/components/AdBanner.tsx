import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function AdBanner() {
  useEffect(() => {
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch (e) {
      console.error("Erro ao carregar anúncio AdSense:", e);
    }
  }, []);

  return (
    <div className="w-full flex justify-center overflow-hidden">
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
