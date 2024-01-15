import React, { useContext, useEffect, useState } from "react";
import style from "../../styles/ProductosTienda.module.scss";
import ContextGeneral from "@/servicios/contextPrincipal";
import ProductoItem from "./ProductoItem";
import {
  MdOutlineDeleteOutline,
  MdKeyboardArrowRight,
  MdKeyboardArrowLeft,
} from "react-icons/md";

function ProductosTienda({ productos }) {
  const context = useContext(ContextGeneral);
  const { setProductosPublicos, setBusqueda } = useContext(ContextGeneral);

  const [numeroPagina, setNumeroPagina] = useState(0);
  const [productosMostrar, setProductosMostrar] = useState(
    context.productosPublicos.slice(0, 12)
  );

  const limpiar = () => {
    setProductosPublicos(context.productosPublicosCopia);
    setBusqueda("");
  };

  const paginaSiguiente = () => {
    const totalElementos = context.productosPublicos.length;
    const nextPage = numeroPagina + 1;
    const index = nextPage * 12;

    if (totalElementos <= index) return;

    setProductosMostrar(context.productosPublicos.slice(index, index + 12));

    setNumeroPagina(nextPage);
    window.scroll(0, 0);
  };
  const paginaAnterior = () => {
    const prevPage = numeroPagina - 1;

    if (prevPage < 0) return;

    const index = prevPage * 12;

    setProductosMostrar(context.productosPublicos.slice(index, index + 12));

    setNumeroPagina(prevPage);
    window.scroll(0, 0);
  };

  const ordenarDestacados = () => {
    const activos = context.productosPublicos.filter((item) => item.destacado);
    const inactivos = context.productosPublicos.filter(
      (item) => !item.destacado
    );
    setProductosPublicos([...activos, ...inactivos]);
  };

  useEffect(() => {
    setProductosMostrar(context.productosPublicos.slice(0, 12));
    setNumeroPagina(0);
  }, [context.productosPublicos]);

  return (
    <div className={style.container}>
      <div className={style.p__container}>
        <p className={style.tienda__p}>
          {context.productosPublicos.length} Productos
        </p>
        {(context.busqueda != "" ||
          context.productosPublicos.length !=
            context.productosPublicosCopia.length) && (
          <div
            className={style.tienda__p}
            onClick={limpiar}
            style={{ cursor: "pointer" }}
          >
            {context.busqueda != "" ? (
              <p>{context.busqueda}</p>
            ) : (
              <p>Limpiar Busqueda</p>
            )}
            <MdOutlineDeleteOutline className={style.icon} />
          </div>
        )}
      </div>

      <div className={style.container__items}>
        {context.productosPublicos &&
          context.productosPublicos
            .sort((a, b) => b.destacado - a.destacado)
            .map((item) => {
              return <ProductoItem key={item.id} item={item} />;
            })}
      </div>

      {context.productosPublicos.length > 12 && (
        <div className={style.paginas}>
          <MdKeyboardArrowLeft
            onClick={paginaAnterior}
            className={style.icon}
          />

          <p>{numeroPagina + 1}</p>
          <MdKeyboardArrowRight
            onClick={paginaSiguiente}
            className={style.icon}
          />
        </div>
      )}
    </div>
  );
}

export default ProductosTienda;
