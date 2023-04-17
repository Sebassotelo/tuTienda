import React, { useState, useContext, useEffect } from "react";
import style from "../styles/BuscadorTienda.module.scss";
import ContextGeneral from "@/servicios/contextPrincipal";

import { push } from "next/router";
import { AiOutlineSearch } from "react-icons/ai";

function BuscadorTienda({ setShow }) {
  const context = useContext(ContextGeneral);
  const { setProductosPublicos, setBusqueda } = useContext(ContextGeneral);
  const [search, setSearch] = useState("");

  const buscador = (e) => {
    e.preventDefault(e);
    let busca = e.target.inputBusca.value;
    setBusqueda(e.target.inputBusca.value);

    busca = busca.toLowerCase();

    const objetosFiltrados = context.productosPublicosCopia.filter(
      (objeto) =>
        objeto.title.toLowerCase().includes(busca) ||
        objeto.seccion.toLowerCase().includes(busca) ||
        objeto.caracteristicas?.toLowerCase().includes(busca)
    );

    setProductosPublicos(objetosFiltrados);
    e.target.inputBusca.value = "";
    push("/productos");
    setShow(false);
  };

  return (
    <div className={style.container}>
      <form action="" onSubmit={buscador}>
        <input
          type="text"
          placeholder="Ingrese un producto/seccion/caracteristica"
          id="inputBusca"
        />
        <button type="submit">
          <AiOutlineSearch className={style.icon} />
        </button>
      </form>
    </div>
  );
}

export default BuscadorTienda;
