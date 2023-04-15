import ContextGeneral from "@/servicios/contextPrincipal";
import React, { useContext, useEffect, useState } from "react";

function ItemMenuProductos({ funcion, item, click }) {
  const [contador, setContador] = useState(0);
  const context = useContext(ContextGeneral);

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
    <li
      onClick={() => {
        funcion(item);
        click();
      }}
    >
      {item} {`(${contador})`}
    </li>
  );
}

export default ItemMenuProductos;
