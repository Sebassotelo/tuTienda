import ProductoNuevo from "@/componentes/ProductoNuevo";
import React, { useContext, useEffect, useState } from "react";
import style from "../../styles/PanelDeControlIndex.module.scss";
import ContextGeneral from "@/servicios/contextPrincipal";
import ProductoPanel from "@/componentes/ProductoPanel";
import SeccionNueva from "@/componentes/SeccionNueva";
import Head from "next/head";

import { onAuthStateChanged } from "firebase/auth";
import Descuentos from "@/componentes/Descuentos";
import BuscadorPanel from "@/componentes/BuscadorPanel";

import { push } from "next/router";
import Loader from "@/componentes/Loader";
import Configuracion from "@/componentes/configuracion/Configuracion";

import {
  MdOutlineDiscount,
  MdOutlineShoppingBasket,
  MdPerson,
  MdOutlineSettings,
} from "react-icons/md";

function Index() {
  const context = useContext(ContextGeneral);
  const { llamadaDB, inspectorSesion, verificarLogin } =
    useContext(ContextGeneral);

  const [showSeccion, setShowSeccion] = useState(0);
  // 0 = Seccion Configuracion Perfil
  // 1 = Seccion Productos
  // 2 = Seccion Descuentos
  // 3 = Seccion Stock
  // 4 = Seccion Usuario

  const [showNuevoProducto, setShowNuevoProducto] = useState(false);

  const mostrarVentana = () => {
    setShowNuevoProducto(!showNuevoProducto);
    if (showNuevoProducto === true) {
      document.body.style.overflow = "";
    } else {
      document.body.style.overflow = "hidden";
    }
  };

  useEffect(() => {
    verificarLogin();

    if (context.estadoUsuario == 0) {
      push("/");
    }
  }, []);
  return (
    <>
      <Head>
        <title> {context.nombreTienda} | Panel de Control</title>
      </Head>
      <div className={style.container}>
        {context.loader ? (
          <>
            {/* menu pc */}
            <div className={style.menu}>
              {context.nombreTienda && (
                <p>
                  <MdPerson /> u/{context.nombreTienda}
                </p>
              )}
              <li
                onClick={() => setShowSeccion(0)}
                style={{
                  color: showSeccion == 0 && "hsla(0, 57%, 55%, 1)",
                  marginLeft: showSeccion == 0 && "15px",
                }}
              >
                {" "}
                <MdOutlineSettings />
                Configuracion
              </li>
              <li
                onClick={() => setShowSeccion(1)}
                style={{
                  color: showSeccion == 1 && "hsla(0, 57%, 55%, 1)",
                  marginLeft: showSeccion == 1 && "15px",
                }}
              >
                {" "}
                <MdOutlineShoppingBasket />
                Productos
              </li>
              <li
                onClick={() => setShowSeccion(2)}
                style={{
                  color: showSeccion == 2 && "hsla(0, 57%, 55%, 1)",
                  marginLeft: showSeccion == 2 && "15px",
                }}
              >
                {" "}
                <MdOutlineDiscount />
                Descuentos
              </li>
            </div>

            {/* menu Movil */}
            <div className={style.menu__movil}>
              <li onClick={() => setShowSeccion(0)}>Configuracion</li>
              <li onClick={() => setShowSeccion(1)}>Productos</li>
              <li onClick={() => setShowSeccion(2)}>Descuentos</li>
            </div>
            <div className={style.secciones}>
              {showSeccion == 0 && <Configuracion />}
              {showSeccion == 1 && (
                <>
                  <SeccionNueva />
                  {context.secciones.length > 0 ? (
                    <>
                      <div className={style.cabecera__productos}>
                        <BuscadorPanel />
                        <p
                          className={style.producto__nuevo__btn}
                          onClick={mostrarVentana}
                        >
                          Nuevo Producto
                        </p>
                      </div>

                      <div className={style.listaProducto}>
                        {showNuevoProducto && (
                          <ProductoNuevo
                            setShowNuevoProducto={mostrarVentana}
                          />
                        )}

                        {context.productos &&
                          context.productos.map((item) => {
                            return (
                              <>
                                {" "}
                                <ProductoPanel
                                  title={item.title}
                                  precio={item.precio}
                                  desc={item.desc}
                                  img={item.img}
                                  stock={item.stock}
                                  caracteristicas={item.caracteristicas}
                                  id={item.id}
                                  seccion={item.seccion}
                                  descuento={item.descuento}
                                  precioDescuento={item.precioDescuento}
                                  destacado={item.destacado}
                                />
                              </>
                            );
                          })}
                      </div>
                    </>
                  ) : (
                    <p>Creá una categoria para poder agregar productos.</p>
                  )}
                </>
              )}
              {showSeccion == 2 && <Descuentos />}
            </div>
          </>
        ) : (
          <Loader />
        )}
      </div>
    </>
  );
}

export default Index;
