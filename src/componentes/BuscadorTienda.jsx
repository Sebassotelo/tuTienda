import React, { useContext } from "react";
import ContextGeneral from "@/servicios/contextPrincipal";
import { AiOutlineSearch } from "react-icons/ai";
import { toast } from "sonner";

function BuscadorTienda({ setShow }) {
  const context = useContext(ContextGeneral);
  const { setProductosPublicos, setBusqueda } = useContext(ContextGeneral);

  const normalizar = (value) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const buscador = (e) => {
    e.preventDefault();
    const buscaOriginal = e.target.inputBusca.value.trim();

    if (!buscaOriginal) {
      setProductosPublicos(context.productosPublicosCopia);
      setBusqueda("");
      setShow?.(false);
      return;
    }

    const busca = normalizar(buscaOriginal);

    const objetosFiltrados = context.productosPublicosCopia.filter((objeto) => {
      const title = normalizar(objeto.title || "");
      const seccion = normalizar(objeto.seccion || "");
      const caracteristicas = normalizar(objeto.caracteristicas || "");

      return (
        title.includes(busca) ||
        seccion.includes(busca) ||
        caracteristicas.includes(busca)
      );
    });

    if (objetosFiltrados.length === 0) {
      toast.error("No se encontraron productos para esa busqueda.");
      e.target.inputBusca.value = "";
      return;
    }

    setBusqueda(buscaOriginal);
    setProductosPublicos(objetosFiltrados);
    e.target.inputBusca.value = "";
    setShow?.(false);
  };

  return (
    <form
      action=""
      onSubmit={buscador}
      className="grid w-full max-w-full grid-cols-[minmax(0,1fr)_3.25rem] overflow-hidden rounded-2xl border border-zinc-300 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition focus-within:border-brand-coral focus-within:ring-4 focus-within:ring-red-100/70"
    >
      <input
        type="text"
        placeholder="Buscar producto, categoria o caracteristica"
        id="catalog-search-input"
        name="inputBusca"
        className="min-h-[52px] min-w-0 border-0 bg-white px-4 text-sm font-semibold text-zinc-950 outline-none placeholder:text-zinc-400"
      />
      <button
        type="submit"
        className="grid min-h-[52px] cursor-pointer place-items-center border-0 bg-zinc-950 text-xl text-white transition hover:bg-zinc-800"
        aria-label="Buscar"
      >
        <AiOutlineSearch />
      </button>
    </form>
  );
}

export default BuscadorTienda;
