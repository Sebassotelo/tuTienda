import React, { useState, useContext, useEffect } from "react";
import style from "../styles/BuscadorPanel.module.scss";
import ContextGeneral from "@/servicios/contextPrincipal";
import { toast } from "sonner";

function BuscadorPanel() {
  const context = useContext(ContextGeneral);
  const { setProductos } = useContext(ContextGeneral);
  const [search, setSearch] = useState("");

  const buscador = (e) => {
    e.preventDefault(e);
    let busca = e.target.inputBusca.value;

    busca = busca
      .toLowerCase()
      .replace(/á/g, "a")
      .replace(/é/g, "e")
      .replace(/í/g, "i")
      .replace(/ó/g, "o")
      .replace(/ú/g, "u");

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
      toast.error(
        "Lo siento, no se encontraron productos que coincidan con tu búsqueda. "
      );
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
    <div className={style.container}>
      <form action="" onSubmit={buscador}>
        <input
          type="text"
          placeholder="Ingrese un producto/seccion/caracteristica"
          id="inputBusca"
        />
        <button type="submit">Buscar</button>
      </form>
      {context.productos != context.productosCopia && (
        <>
          <p onClick={limpiarBusqueda}>Limpiar Busqueda</p>
          <p style={{ cursor: "default" }}>
            {context.productos.length} Productos
          </p>
        </>
      )}
    </div>
  );
}

export default BuscadorPanel;
