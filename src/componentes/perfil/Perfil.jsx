import React, { useContext } from "react";
import ContextGeneral from "@/servicios/contextPrincipal";
import { AiOutlineInstagram, AiOutlineWhatsApp } from "react-icons/ai";
import { FaMapMarkerAlt } from "react-icons/fa";

function Perfil({ configuracion }) {
  const context = useContext(ContextGeneral);
  const data = configuracion || context.configuracion || {};
  const logo = data.logo || context.urlLogo;

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.055)]">
      <div className="h-3 bg-[linear-gradient(90deg,#ef4444_0%,#f97316_46%,#18181b_100%)]" />
      <div className="flex min-w-0 flex-col gap-5 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          {logo && (
            <img
              src={logo}
              alt={context.nombreTienda || "Logo de la tienda"}
              className="h-16 w-16 shrink-0 rounded-2xl border border-zinc-200 bg-slate-50 object-cover p-1 shadow-sm sm:h-24 sm:w-24"
            />
          )}
          <div className="min-w-0">
            <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-coral">
              Tienda publica
            </p>
            <h1 className="m-0 mt-1 truncate font-display text-2xl font-bold leading-tight text-zinc-950 sm:text-[2.65rem]">
              {context.nombreTienda}
            </h1>
            {data.slogan && (
              <p className="m-0 mt-2 max-w-2xl text-sm font-medium leading-6 text-zinc-600">
                {data.slogan}
              </p>
            )}
          </div>
        </div>

        <div className="flex min-w-0 shrink-0 flex-wrap gap-2">
          {data.instagram && (
            <a
              href={`https://www.instagram.com/${data.instagram}/`}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="grid h-11 w-11 place-items-center rounded-xl border border-zinc-300 bg-white text-xl text-zinc-800 cursor-pointer transition hover:-translate-y-0.5 hover:bg-slate-50"
            >
              <AiOutlineInstagram />
            </a>
          )}
          {data.whatsapp && (
            <a
              href={`https://api.whatsapp.com/send/?phone=549${data.whatsapp}&type=phone_number&app_absent=0`}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="grid h-11 w-11 place-items-center rounded-xl border border-emerald-200 bg-emerald-50 text-xl text-emerald-700 cursor-pointer transition hover:-translate-y-0.5 hover:bg-emerald-100"
            >
              <AiOutlineWhatsApp />
            </a>
          )}
          {data.maps && (
            <a
              href={data.maps}
              target="_blank"
              rel="noreferrer"
              aria-label="Ubicacion"
              className="grid h-11 w-11 place-items-center rounded-xl border border-zinc-300 bg-white text-lg text-zinc-800 cursor-pointer transition hover:-translate-y-0.5 hover:bg-slate-50"
            >
              <FaMapMarkerAlt />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

export default Perfil;



