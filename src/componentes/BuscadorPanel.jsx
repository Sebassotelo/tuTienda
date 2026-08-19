import React, { useState, useContext } from "react";
import ContextGeneral from "@/servicios/contextPrincipal";
import { toast } from "sonner";

function BuscadorPanel() {
  const context = useContext(ContextGeneral);
  const { setProductos } = useContext(ContextGeneral);

  const buscador = (e) => {
    e.preventDefault(e);
    let busca = e.target.inputBusca.value;

    busca = busca
      .toLowerCase()
      .replace(/Ã¡/g, "a")
      .replace(/Ã©/g, "e")
      .replace(/Ã­/g, "i")
      .replace(/Ã³/g, "o")
      .replace(/Ãº/g, "u");

    const objetosFiltrados = context.productosCopia.filter(
      (objeto) =>
        objeto.title
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .includes(busca) ||
        objeto.seccion
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .includes(busca) ||
        objeto.caracteristicas
          ?.toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .includes(busca)
    );

    if (objetosFiltrados.length === 0) {
      toast.error("No se encontraron productos que coincidan con tu busqueda.");
      e.target.inputBusca.value = "";
    } else {
      setProductos(objetosFiltrados);
      e.target.inputBusca.value = "";
    }
  };

  const limpiarBusqueda = () => {
    setProductos(context.productosCopia);
  };

  return (
    <div className="grid w-full gap-2 lg:max-w-xl">
      <form action="" onSubmit={buscador} className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <input
          className="min-h-[44px] w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-900 outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-zinc-950 focus:ring-4 focus:ring-zinc-950/10"
          type="text"
          placeholder="Buscar producto, categoria o caracteristica"
          id="inputBusca"
        />
        <button
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 text-sm font-extrabold text-zinc-700 transition hover:bg-slate-50"
          type="submit"
        >
          Buscar
        </button>
      </form>
      {context.productos != context.productosCopia && (
        <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-zinc-700">
          <button
            type="button"
            onClick={limpiarBusqueda}
            className="border-0 bg-transparent p-0 text-sm font-extrabold text-brand-coral underline underline-offset-4"
          >
            Limpiar busqueda
          </button>
          <span>{context.productos.length} productos</span>
        </div>
      )}
    </div>
  );
}

export default BuscadorPanel;





