"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Run the unmodified skill modules after React has mounted each route. */
export default function TasteMotion() {
  const pathname = usePathname();
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "module";
    script.textContent = `
      const motion = await import('/taste/motion/motion.js');
      motion.refresh();
      const moments = await import('/taste/moments/moments.js');
      await moments.mountAll(document.querySelector('main'));
      document.documentElement.dataset.momentsReady = String(document.querySelectorAll('[data-moment-mounted]').length);
    `;
    document.body.appendChild(script);
    return () => {
      script.remove();
      document.querySelectorAll<HTMLElement & { __moment?: { destroy?: () => void } }>("[data-moment-mounted]").forEach((element) => element.__moment?.destroy?.());
    };
  }, [pathname]);
  return null;
}
