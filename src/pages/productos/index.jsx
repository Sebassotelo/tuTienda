import React, { useContext, useEffect, useState } from "react";
import style from "../../styles/ProductosIndex.module.scss";
import ContextGeneral from "@/servicios/contextPrincipal";
import ItemMenuProductos from "@/componentes/ItemMenuProductos";
import ProductosTienda from "@/componentes/productos/ProductosTienda";
import Head from "next/head";
import { BiMenu } from "react-icons/bi";
import Loader from "@/componentes/Loader";

function Index() {
  const context = useContext(ContextGeneral);
  const {
    setProductos,
    setProductosCopia,
    llamadaDB,
    setProductosPublicos,
    verificarLogin,
  } = useContext(ContextGeneral);

  const [showCategoria, setShowCategoria] = useState(false);

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

  const mostrarMenu = () => {
    setShowCategoria(!showCategoria);
  };

  useEffect(() => {
    if (context.productosPublicos.length == 0) {
      llamadaDB();
    }
    verificarLogin();
  }, []);

  return (
    <>
      {context.loader ? (
        <>
          <Head>
            <title>SrasMedias 🧦 | Productos</title>
          </Head>

          <div className={style.container}>
            <div className={style.container__productos}>
              {/* menu PC */}
              <ul className={style.menu}>
                <h3>Categorias</h3>
                <li
                  onClick={() =>
                    setProductosPublicos(context.productosPublicosCopia)
                  }
                >
                  Todo {`(${context.productosPublicosCopia.length})`}
                </li>
                <li onClick={filtrarSeccionOfertas}>
                  Ofertas {`(${context.contadorOfert})`}{" "}
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

              {/* menu mobile */}
              <ul className={style.menu__movil}>
                <div className={style.movil__cat}>
                  <BiMenu className={style.cat__icon} />{" "}
                  <h3 onClick={mostrarMenu}>Categorias</h3>
                </div>

                {showCategoria && (
                  <>
                    <li
                      onClick={() =>
                        setProductosPublicos(context.productosPublicosCopia)
                      }
                    >
                      Todo {`(${context.productosPublicosCopia.length})`}
                    </li>
                    <li onClick={filtrarSeccionOfertas}>
                      Ofertas {`(${context.contadorOfert})`}{" "}
                    </li>
                    {context.secciones &&
                      context.secciones.map((item, i) => {
                        return (
                          <ItemMenuProductos
                            key={i}
                            funcion={filtrarSeccion}
                            item={item}
                            click={mostrarMenu}
                          />
                        );
                      })}
                  </>
                )}
              </ul>
              <div className={style.tienda}>
                <ProductosTienda />
              </div>
            </div>
          </div>
        </>
      ) : (
        <Loader />
      )}
    </>
  );
}

export default Index;
