import ContextGeneral from "@/servicios/contextPrincipal";
import React, { useContext, useEffect, useState } from "react";
import style from "../styles/ItemMenu.module.scss";

function ItemMenuProductos({ funcion, item, click }) {
  const [contador, setContador] = useState(0);
  const context = useContext(ContextGeneral);
  const { setBusqueda } = useContext(ContextGeneral);

  const [colSeccion, setColSeccion] = useState(null);

  const contadorProductos = () => {
    const nuevoArray = context.productosPublicosCopia.filter(
      (e) => e.seccion == item
    );
    setContador(nuevoArray.length);
  };

  useEffect(() => {
    contadorProductos();
  }, []);

  return (
    <>
      <li
        className={style.li}
        onClick={() => {
          funcion(item);
        }}
      >
        {item} {`(${contador})`}
      </li>
      <li
        className={style.li__movil}
        onClick={() => {
          funcion(item);
          click();
          setBusqueda("");
        }}
      >
        {item} {`(${contador})`}
      </li>
    </>
  );
}

export default ItemMenuProductos;
