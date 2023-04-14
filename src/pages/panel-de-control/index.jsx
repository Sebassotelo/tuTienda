import ProductoNuevo from "@/componentes/ProductoNuevo";
import React, { useContext, useEffect, useState } from "react";
import style from "../../styles/PanelDeControlIndex.module.scss";
import ContextGeneral from "@/servicios/contextPrincipal";
import ProductoPanel from "@/componentes/ProductoPanel";
import SeccionNueva from "@/componentes/SeccionNueva";

import { onAuthStateChanged } from "firebase/auth";
import Descuentos from "@/componentes/Descuentos";
import BuscadorPanel from "@/componentes/BuscadorPanel";

import { push } from "next/router";

function index() {
  const context = useContext(ContextGeneral);
  const { llamadaDB, inspectorSesion, verificarLogin } =
    useContext(ContextGeneral);

  const [showSeccion, setShowSeccion] = useState(1);
  // 1 = Seccion Productos
  // 2 = Seccion Descuentos
  // 3 = Seccion Stock
  // 4 = Seccion Usuario

  const [showNuevoProducto, setShowNuevoProducto] = useState(false);

  useEffect(() => {
    verificarLogin();
    llamadaDB();

    if (context.estadoUsuario == 0) {
      push("/");
    }
  }, []);
  return (
    <div className={style.container}>
      <div className={style.menu}>
        <li onClick={() => setShowSeccion(1)}>Productos</li>
        <li onClick={() => setShowSeccion(2)}>Descuentos</li>
      </div>
      <div className={style.secciones}>
        {showSeccion == 1 && (
          <>
            <SeccionNueva />

            <BuscadorPanel />

            {showNuevoProducto ? (
              <ProductoNuevo setShowNuevoProducto={setShowNuevoProducto} />
            ) : (
              <>
                <p
                  className={style.producto__nuevo__btn}
                  onClick={() => setShowNuevoProducto(true)}
                >
                  Nuevo Producto
                </p>
              </>
            )}
            <div className={style.listaProducto}>
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
                      />
                    </>
                  );
                })}
            </div>
          </>
        )}
        {showSeccion == 2 && <Descuentos />}
      </div>
    </div>
  );
}

export default index;
