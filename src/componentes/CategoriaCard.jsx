import React, { useContext, useEffect, useState } from "react";
import style from "../styles/CategoriaCard.module.scss";
import ContextGeneral from "@/servicios/contextPrincipal";
import Link from "next/link";

function CategoriaCard({ item }) {
  const context = useContext(ContextGeneral);
  const { setProductosPublicos } = useContext(ContextGeneral);

  const [producto, setProducto] = useState({});

  const filtrar = () => {
    const elem = context.productosPublicosCopia.filter(
      (e) => e.seccion == item
    );
    setProducto(elem[0]);
  };

  const filtrarSeccion = () => {
    const nuevoArray = context.productosPublicosCopia.filter(
      (e) => e.seccion == item
    );
    setProductosPublicos(nuevoArray);
  };

  useEffect(() => {
    filtrar();
  }, []);

  return (
    <>
      {producto && (
        <div className={style.container}>
          <div className={style.img}>
            <img src={producto.img} alt="" className={style.imagen} />
            <Link
              href="/productos"
              className={style.p}
              onClick={filtrarSeccion}
            >
              <p>
                <span>[</span>
                {producto.seccion}
                <span>]</span>
              </p>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

export default CategoriaCard;
