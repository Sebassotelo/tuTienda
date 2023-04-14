import React, { useContext, useEffect, useState } from "react";
import style from "../../styles/ProductosIndex.module.scss";
import ContextGeneral from "@/servicios/contextPrincipal";
import ItemMenuProductos from "@/componentes/ItemMenuProductos";
import ProductosTienda from "@/componentes/productos/ProductosTienda";

function Index() {
  const context = useContext(ContextGeneral);
  const {
    setProductos,
    setProductosCopia,
    llamadaDB,
    setProductosPublicos,
    verificarLogin,
  } = useContext(ContextGeneral);

  const [contadorOfert, setContadorOfert] = useState(0);

  const filtrarSeccion = (id) => {
    const nuevoArray = context.productosPublicosCopia.filter(
      (item) => item.seccion == id
    );
    setProductosPublicos(nuevoArray);
  };
  const filtrarSeccionOfertas = () => {
    const nuevoArray = context.productosPublicos.filter(
      (item) => item.descuento
    );
    setProductosPublicos(nuevoArray);
  };

  const contadorOfertas = () => {
    const nuevoArray = context.productosPublicos.filter((e) => e.descuento);
    setContadorOfert(nuevoArray.length);
  };

  useEffect(() => {
    if (context.productosPublicos.length == 0) {
      llamadaDB();
    }
    verificarLogin();
    contadorOfertas();
  }, []);

  return (
    <div className={style.container}>
      <div className={style.container__productos}>
        <ul className={style.menu}>
          <h3>Categorias</h3>
          <li
            onClick={() => setProductosPublicos(context.productosPublicosCopia)}
          >
            Todo {`(${context.productosPublicosCopia.length})`}
          </li>
          <li onClick={filtrarSeccionOfertas}>
            Ofertas {`(${contadorOfert})`}{" "}
          </li>
          {context.secciones &&
            context.secciones.map((item, i) => {
              return (
                <ItemMenuProductos
                  key={i}
                  funcion={filtrarSeccion}
                  item={item}
                />
              );
            })}
        </ul>
        <ProductosTienda />
      </div>
    </div>
  );
}

export default Index;
