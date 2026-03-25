import { useEffect, useRef } from "react";

export default function AdBanner() {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      try {
        if (typeof window !== "undefined") {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          initialized.current = true;
        }
      } catch (e) {
        console.error("Erro AdSense:", e);
      }
    }
  }, []);

  return (
    <section className="w-full flex justify-center px-0 md:px-4 my-6 overflow-hidden">
      {/* Container com o fundo cinza claro e bordas sutis igual ao da Globo */}
      <div className="w-full max-w-[1200px] flex flex-col items-center bg-[#f7f7f7] border-y md:border border-[#eeeeee] md:rounded-sm py-4">
        {/* Rótulo discreto que sites de notícias usam */}
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">
          Publicidade
        </span>

        <div className="w-full flex justify-center">
          <ins
            className="adsbygoogle"
            style={{
              display: "block",
              width: "100%",
              minWidth: "300px",
              /* Trava de altura: No mobile fica pequeno, no PC pode crescer um pouco */
              height: "auto",
              maxHeight: "280px",
            }}
            data-ad-client="ca-pub-9394428727340956"
            data-ad-slot="8360438065"
            /* 'horizontal' evita que o Google mande aqueles quadrados gigantes no mobile */
            data-ad-format="horizontal"
            data-full-width-responsive="false"
          />
        </div>
      </div>
    </section>
  );
}
