import React, { useContext } from "react";
import ContextGeneral from "@/servicios/contextPrincipal";
import { BsCartPlus, BsPinAngleFill, BsPlusLg } from "react-icons/bs";
import { MdOutlineLocalOffer } from "react-icons/md";
import { toast } from "sonner";

function ProductoItem({ item, onOpenProduct }) {
  const context = useContext(ContextGeneral);
  const { setCarrito, actualizacionCarrito } = useContext(ContextGeneral);

  const productoEnCarrito = context.carrito.find((producto) => producto.id === item.id);
  const cantidadEnCarrito = productoEnCarrito?.cantidad || 0;

  const agregarCarrito = () => {
    const productoExistente = context.carrito.find((producto) => producto.id === item.id);

    if (productoExistente) {
      if (productoExistente.cantidad >= productoExistente.stock) {
        toast.error("No hay stock suficiente para agregar esa cantidad al carrito");
        return;
      }

      const carritoActualizado = context.carrito.map((producto) =>
        producto.id === item.id
          ? { ...producto, cantidad: producto.cantidad + 1 }
          : producto
      );

      setCarrito(carritoActualizado);
      actualizacionCarrito();
      toast.success(`${item.title} Agregado al carrito`);
      return;
    }

    const itemCarrito = {
      title: item.title,
      precio: item.descuento ? item.precioDescuento : item.precio,
      id: item.id,
      img: item.img,
      stock: item.stock,
      cantidad: 1,
      seccion: item.seccion,
    };

    setCarrito((prev) => [...prev, itemCarrito]);
    actualizacionCarrito();
    toast.success(`${item.title} Agregado al carrito`);
  };

  const handleOpenProduct = () => {
    onOpenProduct?.(item);
  };

  return (
    <article className="group grid h-full w-full max-w-full min-w-0 grid-rows-[auto_1fr] overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(15,23,42,0.10)] sm:rounded-2xl">
      <button
        type="button"
        onClick={handleOpenProduct}
        className="relative block aspect-[4/3] w-full max-w-full cursor-pointer overflow-hidden border-0 bg-transparent p-0 text-left outline-none"
      >
        <img
          className="block h-full w-full object-cover transition duration-300 group-hover:scale-105"
          src={item.img}
          loading="lazy"
          alt={item.title || "Producto"}
        />
        <div className="absolute left-1.5 top-1.5 flex max-w-[calc(100%-12px)] flex-wrap gap-1 sm:left-2 sm:top-2 sm:gap-1.5">
          {item.descuento && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-sm sm:px-2 sm:py-1 sm:text-[11px]">
              <MdOutlineLocalOffer /> Oferta
            </span>
          )}
          {item.destacado && (
            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-950 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-sm sm:px-2 sm:py-1 sm:text-[11px]">
              <BsPinAngleFill /> Destacado
            </span>
          )}
        </div>
      </button>

      <div className="grid min-h-[168px] min-w-0 grid-rows-[1fr_auto] gap-3 p-2.5 sm:min-h-[210px] sm:gap-4 sm:p-4">
        <button
          type="button"
          onClick={handleOpenProduct}
          className="min-w-0 cursor-pointer border-0 bg-transparent p-0 text-left"
        >
          {item.seccion && (
            <p className="m-0 truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-coral sm:text-[11px]">
              {item.seccion}
            </p>
          )}
          <h3 className="m-0 mt-1 line-clamp-2 break-words font-display text-sm font-semibold leading-snug text-zinc-950 transition group-hover:text-zinc-700 sm:text-lg">
            {item.title}
          </h3>
        </button>

        <div className="grid min-w-0 gap-3">
          <div className="min-w-0">
            {item.descuento ? (
              <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="font-display text-[1.15rem] font-extrabold leading-none text-zinc-950 sm:text-[1.35rem]">
                  ${item.precioDescuento}
                </span>
                <span className="text-xs font-semibold text-zinc-400 line-through sm:text-sm">
                  ${item.precio}
                </span>
              </div>
            ) : (
              <span className="font-display text-[1.15rem] font-extrabold leading-none text-zinc-950 sm:text-[1.35rem]">
                ${item.precio}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={agregarCarrito}
            className={`inline-flex min-h-[2.75rem] w-full cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 text-[0.9rem] font-extrabold shadow-lg transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 sm:min-h-[2.9rem] ${
              cantidadEnCarrito > 0
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-emerald-950/10 hover:bg-emerald-100 focus:ring-emerald-100"
                : "border-zinc-950 bg-zinc-950 text-white shadow-zinc-950/18 hover:bg-zinc-800 focus:ring-zinc-300/60"
            }`}
            aria-label={cantidadEnCarrito > 0 ? "Agregar otra unidad al carrito" : "Agregar al carrito"}
          >
            <span className={`grid h-7 w-7 place-items-center rounded-full text-base ${
              cantidadEnCarrito > 0 ? "bg-emerald-100" : "bg-white/10"
            }`}>
              {cantidadEnCarrito > 0 ? <BsPlusLg /> : <BsCartPlus />}
            </span>
            <span>{cantidadEnCarrito > 0 ? `Sumar otro (${cantidadEnCarrito})` : "Agregar"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductoItem;
