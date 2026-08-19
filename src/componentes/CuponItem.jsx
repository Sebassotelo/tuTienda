import React, { useState } from "react";
import EditarCupon from "./EditarCupon";
import { GrEdit } from "react-icons/gr";
import { MdOutlineDeleteOutline } from "react-icons/md";

function CuponItem({ item, eliminarCupon }) {
  const [showEditar, setShowEditar] = useState(false);
  const value = item.montoPesosActivo ? `$${item.montoPesos}` : `${item.monto}%`;

  return (
    <div className="grid gap-3">
      <article className="grid gap-4 rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-[0_14px_42px_rgba(15,23,42,0.045)] ring-1 ring-zinc-950/[0.02] sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="m-0 font-display text-lg font-extrabold text-zinc-950">
              {item.cupon}
            </h4>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${
                item.activo ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
              }`}
            >
              {item.activo ? "ON" : "OFF"}
            </span>
          </div>
          <p className="m-0 mt-2 text-sm font-bold text-zinc-700">
            {item.montoPesosActivo ? "Descuento en pesos" : "Descuento porcentual"}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <strong className="font-display text-2xl font-extrabold text-brand-coral">
            {value}
          </strong>
          <div className="flex gap-2">
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-xl border border-zinc-300 bg-white text-zinc-700 transition hover:bg-slate-50 hover:text-zinc-950"
              onClick={() => setShowEditar(!showEditar)}
              aria-label="Editar cupon"
            >
              <GrEdit />
            </button>
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-xl border border-zinc-300 bg-white text-zinc-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              onClick={() => eliminarCupon(item.id)}
              aria-label="Eliminar cupon"
            >
              <MdOutlineDeleteOutline className="text-xl" />
            </button>
          </div>
        </div>
      </article>
      {showEditar && (
        <EditarCupon item={item} setShow={setShowEditar} show={showEditar} />
      )}
    </div>
  );
}

export default CuponItem;



