import React from "react";

function Footer() {
  return (
    <footer className="mb-16 w-full max-w-full overflow-hidden border-t border-zinc-200 bg-white px-5 py-6 text-center sm:mb-0">
      <p className="m-0 text-sm font-medium text-zinc-500">
        Desarrollado por{" "}
        <a
          href="https://www.tyr-ai.com.ar/"
          target="_blank"
          rel="noreferrer"
          className="font-bold text-zinc-950 no-underline transition hover:text-brand-coral"
        >
          TYR
        </a>
      </p>
    </footer>
  );
}

export default Footer;
