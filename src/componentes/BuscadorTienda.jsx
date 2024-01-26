import React, { useState, useContext, useEffect } from "react";
import style from "../styles/BuscadorTienda.module.scss";
import ContextGeneral from "@/servicios/contextPrincipal";

import { push } from "next/router";
import { AiOutlineSearch } from "react-icons/ai";
import { toast } from "sonner";

function BuscadorTienda({ setShow }) {
  const context = useContext(ContextGeneral);
  const { setProductosPublicos, setBusqueda } = useContext(ContextGeneral);
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

    const objetosFiltrados = context.productosPublicosCopia.filter(
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

    console.log(objetosFiltrados);

    if (objetosFiltrados.length === 0) {
      toast.error(
        "Lo siento, no se encontraron productos que coincidan con tu búsqueda. "
      );
      e.target.inputBusca.value = "";
    } else {
      setBusqueda(e.target.inputBusca.value);
      setProductosPublicos(objetosFiltrados);
      e.target.inputBusca.value = "";
      setShow(false);
    }
  };

  return (
    <div className={style.container}>
      <form action="" onSubmit={buscador}>
        <input
          type="text"
          placeholder="Ingrese un producto/categoria/caracteristica"
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
