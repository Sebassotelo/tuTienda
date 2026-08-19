import React, { useContext, useState } from "react";
import EditarProducto from "./EditarProducto";
import ContextGeneral from "@/servicios/contextPrincipal";
import { GrEdit } from "react-icons/gr";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { deleteProductForAccount } from "@/servicios/productosBatch";
import { toast } from "sonner";

function StatusPill({ active, label }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold ${
        active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
      }`}
    >
      {label}: {active ? "ON" : "OFF"}
    </span>
  );
}

function ProductoPanel({
  title,
  precio,
  desc,
  img,
  stock,
  caracteristicas,
  id,
  seccion,
  descuento,
  precioDescuento,
  destacado,
}) {
  const [editarProducto, setEditarProducto] = useState(false);
  const context = useContext(ContextGeneral);
  const { llamadaDB } = useContext(ContextGeneral);

  const eliminarProducto = async (e) => {
    if (confirm("Seguro que desea eliminar este producto?") === true) {
      e.preventDefault(e);

      const nuevoItems = context.productosCopia.filter((item) => item.id != id);

      await deleteProductForAccount({
        firestore: context.firestore,
        email: context.user.email,
        productId: id,
        fallbackProducts: nuevoItems,
        usuario: context.nombreTienda,
        premium: context.premium,
      });
      llamadaDB();
      toast.success(`${title} Eliminado Correctamente`);
    }
  };

  const mostrarEditar = () => {
    setEditarProducto(!editarProducto);
    document.body.style.overflow = editarProducto ? "" : "hidden";
  };

  return (
    <>
      <article className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-[0_14px_42px_rgba(15,23,42,0.045)] transition hover:border-zinc-300 hover:shadow-md hover:shadow-zinc-950/10">
        <div className="grid gap-0 sm:grid-cols-[132px_minmax(0,1fr)]">
          <div className="h-48 bg-slate-50 sm:h-full">
            <img src={img} alt={title} className="h-full w-full object-cover" />
          </div>

          <div className="grid min-w-0 gap-4 p-4 sm:p-5">
            <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-extrabold text-zinc-700">
                    {seccion}
                  </span>
                  {Number(stock) <= 0 && (
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-extrabold text-amber-700">
                      Sin stock publico
                    </span>
                  )}
                </div>
                <h3 className="m-0 mt-3 truncate font-display text-xl font-extrabold text-zinc-950">
                  {title}
                </h3>
                {desc && (
                  <p className="m-0 mt-2 line-clamp-2 text-sm font-medium leading-6 text-zinc-700">
                    {desc}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={mostrarEditar}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-zinc-300 bg-white text-zinc-700 transition hover:bg-slate-50 hover:text-zinc-950"
                  aria-label="Editar producto"
                >
                  <GrEdit />
                </button>
                <button
                  type="button"
                  onClick={eliminarProducto}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-zinc-300 bg-white text-zinc-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  aria-label="Eliminar producto"
                >
                  <MdOutlineDeleteOutline className="text-xl" />
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="block text-xs font-extrabold uppercase tracking-[0.08em] text-zinc-400">
                  Precio
                </span>
                <strong className="mt-1 block font-display text-lg font-extrabold text-zinc-950">
                  ${descuento ? precioDescuento : precio}
                </strong>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="block text-xs font-extrabold uppercase tracking-[0.08em] text-zinc-400">
                  Stock
                </span>
                <strong className="mt-1 block font-display text-lg font-extrabold text-zinc-950">
                  {stock}
                </strong>
              </div>
              <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 p-3">
                <StatusPill active={descuento} label="Descuento" />
                <StatusPill active={destacado} label="Destacado" />
              </div>
            </div>
          </div>
        </div>
      </article>

      {editarProducto && (
        <EditarProducto
          title2={title}
          desc2={desc}
          precio2={precio}
          img2={img}
          stock2={stock}
          seccion2={seccion}
          caracteristicas2={caracteristicas}
          id2={id}
          descuento2={descuento}
          precioDescuento2={precioDescuento}
          setEditarProducto={mostrarEditar}
          destacado2={destacado}
        />
      )}
    </>
  );
}

export default ProductoPanel;




