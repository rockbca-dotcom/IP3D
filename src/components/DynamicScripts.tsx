"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface Script {
  id: string;
  name: string;
  type: string;
  position: string;
  code: string;
}

function detectSite(): "MAIN" {
  return "MAIN";
}

export function DynamicScripts() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loaded, setLoaded] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const fetchScripts = async () => {
      try {
        const site = detectSite();
        const res = await fetch(`/api/scripts?site=${site}`);
        const data = await res.json();
        setScripts(data.scripts || []);
        setLoaded(true);
      } catch (error) {
        console.error("Error loading scripts:", error);
        setLoaded(true);
      }
    };

    fetchScripts();
  }, [pathname]);

  useEffect(() => {
    if (!loaded || scripts.length === 0) return;

    scripts.forEach((script) => {
      const existingScript = document.querySelector(`[data-script-id="${script.id}"]`);
      if (existingScript) return;

      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = script.code;

      const scriptElements = tempDiv.querySelectorAll("script");
      const nonScriptContent = tempDiv.innerHTML.replace(/<script[\s\S]*?<\/script>/gi, "");

      if (nonScriptContent.trim()) {
        const container = document.createElement("div");
        container.setAttribute("data-script-id", script.id);
        container.innerHTML = nonScriptContent;
        
        if (script.position === "HEAD") {
          document.head.appendChild(container);
        } else if (script.position === "BODY_START") {
          document.body.insertBefore(container, document.body.firstChild);
        } else {
          document.body.appendChild(container);
        }
      }

      scriptElements.forEach((originalScript) => {
        const newScript = document.createElement("script");
        newScript.setAttribute("data-script-id", script.id);

        Array.from(originalScript.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });

        if (originalScript.innerHTML) {
          newScript.innerHTML = originalScript.innerHTML;
        }

        if (script.position === "HEAD") {
          document.head.appendChild(newScript);
        } else if (script.position === "BODY_START") {
          document.body.insertBefore(newScript, document.body.firstChild);
        } else {
          document.body.appendChild(newScript);
        }
      });
    });
  }, [scripts, loaded]);

  return null;
}
