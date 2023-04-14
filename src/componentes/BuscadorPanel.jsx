import React, { useState, useContext, useEffect } from "react";
import style from "../styles/BuscadorPanel.module.scss";
import ContextGeneral from "@/servicios/contextPrincipal";
function BuscadorPanel() {
  const context = useContext(ContextGeneral);
  const { setProductos } = useContext(ContextGeneral);
  const [search, setSearch] = useState("");

  const buscador = (e) => {
    e.preventDefault(e);
    let busca = e.target.inputBusca.value;

    busca = busca.toLowerCase();

    const objetosFiltrados = context.productosCopia.filter(
      (objeto) =>
        objeto.title.toLowerCase().includes(busca) ||
        objeto.seccion.toLowerCase().includes(busca) ||
        objeto.caracteristicas?.toLowerCase().includes(busca)
    );

    setProductos(objetosFiltrados);
    e.target.inputBusca.value = "";
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
