import React, { useContext, useEffect, useRef } from "react";
import ContextGeneral from "@/servicios/contextPrincipal";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { MdClose, MdContentCopy, MdOutlineLocalOffer } from "react-icons/md";
import { toast } from "sonner";

const formatPrice = (value) => `$${Number(value || 0).toLocaleString("es-AR")}`;

function Popup({ setShow, item, agregarCarrito }) {
  const context = useContext(ContextGeneral);
  const { setBusqueda, setProductosPublicos } = useContext(ContextGeneral);
  const divRef = useRef(null);

  const filtrarSeccion = () => {
    const nuevoArray = context.productosPublicosCopia.filter(
      (it) => it.seccion == item.seccion
    );
    setProductosPublicos(nuevoArray);
  };

  const volverInicio = () => {
    setProductosPublicos(context.productosPublicosCopia);
    setBusqueda("");
    setShow();
  };

  const filtrarCategoria = () => {
    filtrarSeccion();
    setBusqueda("");
    setShow();
  };

  const copiarLinkProducto = async () => {
    if (typeof window === "undefined") return;

    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link del producto copiado");
    } catch (error) {
      toast.error("No se pudo copiar el link del producto");
    }
  };

  const handleClickOutside = (event) => {
    if (divRef.current && !divRef.current.contains(event.target)) {
      setShow();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[720] grid place-items-center overflow-y-auto bg-zinc-950/45 px-3 py-6 backdrop-blur-sm sm:px-6">
      <article
        ref={divRef}
        className="relative grid w-full max-w-4xl min-w-0 overflow-hidden rounded-2xl bg-white shadow-[0_28px_90px_rgba(15,23,42,0.28)] sm:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]"
      >
        <button
          type="button"
          onClick={setShow}
          className="absolute right-3 top-3 z-10 grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-white/70 bg-white/90 text-xl text-zinc-800 shadow-lg shadow-zinc-950/10 transition hover:-translate-y-0.5 hover:bg-white"
          aria-label="Cerrar detalle"
        >
          <MdClose />
        </button>

        <div className="min-w-0 bg-slate-50">
          <div className="relative aspect-[4/3] h-full min-h-[260px] w-full overflow-hidden sm:aspect-auto sm:min-h-[460px]">
            <img
              src={item.img}
              loading="lazy"
              alt={item.title || "Producto"}
              className="h-full w-full object-cover"
            />
            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              {item.destacado && (
                <span className="rounded-full bg-zinc-950 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                  Destacado
                </span>
              )}
              {item.descuento && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                  <MdOutlineLocalOffer /> Oferta
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid min-w-0 content-between gap-6 p-5 sm:p-7">
          <div className="min-w-0">
            <div className="flex min-w-0 items-start gap-3 pr-11">
              <nav className="flex min-w-0 flex-1 flex-wrap items-center gap-1 text-xs font-medium text-zinc-500">
                <button
                  type="button"
                  onClick={volverInicio}
                  className="cursor-pointer border-0 bg-transparent p-0 text-xs font-semibold text-zinc-700 transition hover:text-brand-coral"
                >
                  Inicio
                </button>
                {item.seccion && (
                  <>
                    <span>/</span>
                    <button
                      type="button"
                      onClick={filtrarCategoria}
                      className="cursor-pointer border-0 bg-transparent p-0 text-xs font-semibold text-zinc-700 transition hover:text-brand-coral"
                    >
                      {item.seccion}
                    </button>
                  </>
                )}
              </nav>

              <button
                type="button"
                onClick={copiarLinkProducto}
                className="inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-zinc-200 bg-slate-50 px-3 text-xs font-semibold text-zinc-500 transition hover:border-zinc-300 hover:bg-white hover:text-zinc-800"
              >
                <MdContentCopy className="text-sm" />
                <span className="hidden sm:inline">Copiar link</span>
              </button>
            </div>

            {item.seccion && (
              <p className="m-0 mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-coral">
                {item.seccion}
              </p>
            )}
            <h3 className="m-0 mt-2 font-display text-3xl font-semibold leading-tight text-zinc-950 sm:text-4xl">
              {item.title}
            </h3>

            {item.desc && (
              <p className="m-0 mt-4 text-sm font-medium leading-6 text-zinc-600">
                {item.desc}
              </p>
            )}

            <div className="mt-6 rounded-2xl border border-zinc-100 bg-slate-50 p-4 shadow-inner shadow-white">
              <div className="flex min-w-0 flex-wrap items-end gap-x-3 gap-y-1">
                {item.descuento ? (
                  <>
                    <p className="m-0 font-display text-4xl font-bold leading-none text-zinc-950">
                      {formatPrice(item.precioDescuento)}
                    </p>
                    <p className="m-0 text-base font-semibold text-zinc-400 line-through">
                      {formatPrice(item.precio)}
                    </p>
                  </>
                ) : (
                  <p className="m-0 font-display text-4xl font-bold leading-none text-zinc-950">
                    {formatPrice(item.precio)}
                  </p>
                )}
              </div>
              <p className="m-0 mt-3 text-sm font-medium text-zinc-500">
                Stock disponible: <span className="font-semibold text-zinc-900">{item.stock}</span>
              </p>
            </div>
          </div>

          <div className="grid gap-2.5">
            <button
              type="button"
              onClick={() => {
                agregarCarrito();
                setShow();
              }}
              className="group flex min-h-[56px] w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border-0 bg-zinc-950 px-5 text-sm font-bold text-white shadow-[0_18px_38px_rgba(15,23,42,0.28)] transition hover:-translate-y-0.5 hover:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-zinc-300/50"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-xl transition group-hover:bg-white/15">
                <AiOutlineShoppingCart />
              </span>
              Agregar al carrito
            </button>
            <button
              type="button"
              className="min-h-[46px] w-full cursor-pointer rounded-2xl border border-transparent bg-transparent px-5 text-sm font-semibold text-zinc-500 transition hover:bg-slate-50 hover:text-zinc-900"
              onClick={setShow}
            >
              Seguir viendo productos
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}

export default Popup;