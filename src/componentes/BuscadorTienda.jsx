import React, { useState, useContext, useEffect } from "react";
import style from "../styles/BuscadorPanel.module.scss";
import ContextGeneral from "@/servicios/contextPrincipal";

function BuscadorTienda() {
  const context = useContext(ContextGeneral);
  const { setProductosPublicos } = useContext(ContextGeneral);
  const [search, setSearch] = useState("");

  const buscador = (e) => {
    e.preventDefault(e);
    let busca = e.target.inputBusca.value;

    busca = busca.toLowerCase();

    const objetosFiltrados = context.productosPublicosCopia.filter(
      (objeto) =>
        objeto.title.toLowerCase().includes(busca) ||
        objeto.seccion.toLowerCase().includes(busca) ||
        objeto.caracteristicas?.toLowerCase().includes(busca)
    );

    setProductosPublicos(objetosFiltrados);
    e.target.inputBusca.value = "";
  };

  const limpiarBusqueda = () => {
    setProductosPublicos(context.productosPublicosCopia);
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
      {context.productosPublicos != context.productosPublicosCopia && (
        <>
          <p onClick={limpiarBusqueda}>Limpiar Busqueda</p>
          <p style={{ cursor: "default" }}>
            {context.productosPublicos.length} Productos
          </p>
        </>
      )}
    </div>
  );
}

export default BuscadorTienda;
