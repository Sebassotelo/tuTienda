import React, { useContext, useEffect, useState } from "react";
import style from "../../styles/ProductosIndex.module.scss";
import ContextGeneral from "@/servicios/contextPrincipal";
import ItemMenuProductos from "@/componentes/ItemMenuProductos";
import ProductosTienda from "@/componentes/productos/ProductosTienda";
import Head from "next/head";
import { BiMenu } from "react-icons/bi";
import Loader from "@/componentes/Loader";
import { motion } from "framer-motion";

import { useRouter } from "next/router";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  query,
  collection,
  where,
  getDocs,
} from "firebase/firestore";
import Perfil from "@/componentes/perfil/Perfil";

function User() {
  const context = useContext(ContextGeneral);
  const {
    llamadaDB,
    setProductosPublicos,
    setProductosPublicosCopia,
    verificarLogin,
    setBusqueda,
    setLoader,
    setSecciones,
    setContadorOfert,
    setCupones,
    setNombreTienda,
    setConfiguracion,
  } = useContext(ContextGeneral);

  const router = useRouter();

  const [showCategoria, setShowCategoria] = useState(false);
  const [perfilPublico, setPerfilPublico] = useState(null);
  const [productosArray, setProductosArray] = useState([]);
  let productosArrayOriginal;

  const filtrarSeccion = (id) => {
    const nuevoArray = context.productosPublicosCopia.filter(
      (item) => item.seccion == id
    );
    setProductosPublicos(nuevoArray);
  };
  const filtrarSeccionOfertas = () => {
    const nuevoArray = context.productosPublicosCopia.filter(
      (item) => item.descuento
    );
    setProductosPublicos(nuevoArray);
  };

  const mostrarMenu = () => {
    setShowCategoria(!showCategoria);
  };

  const llamada = async () => {
    const user = router.query.user;

    const docRef = collection(context.firestore, `users`);
    const q = query(docRef, where("usuario", "==", user));
    const comoQuieras = await getDocs(q);

    comoQuieras.forEach((doc) => (productosArrayOriginal = doc.data()));

    setCupones(productosArrayOriginal.cupones);
    setConfiguracion(productosArrayOriginal.configuracion);
    setNombreTienda(productosArrayOriginal.usuario);

    const array = productosArrayOriginal.items.filter((item) => item.stock > 0);

    setProductosPublicos(array);
    setProductosPublicosCopia(array);
    setSecciones(productosArrayOriginal.secciones);

    setPerfilPublico(productosArrayOriginal);

    const nuevoArray = array.filter((e) => e.descuento);
    setContadorOfert(nuevoArray.length);

    console.log("asdasdasd", productosArrayOriginal);

    // comoQuieras.forEach((doc) => (busqueda = doc.data()));
    // if (busqueda) {
    //   setExiste(true);
    //   setLoader(true);
    // } else {
    //   setExiste(false);
    //   setLoader(true);
    // }

    setLoader(true);
  };

  useEffect(() => {
    if (router.query.user) {
      llamada();
    }
    verificarLogin();
  }, [router.query.user]);

  return (
    <>
      {context.loader ? (
        <>
          <Head>
            <title>{context.nombreTienda} | Tienda Virtual</title>
          </Head>

          <div className={style.container}>
            <Perfil configuracion={context.configuracion} />
            <div className={style.container__productos}>
              {/* menu PC */}
              <ul className={style.menu}>
                <h3>Categorias</h3>
                <li
                  onClick={() => {
                    setProductosPublicos(context.productosPublicosCopia);
                    setBusqueda("");
                  }}
                >
                  Todo {`(${context.productosPublicosCopia.length})`}
                </li>
                {context.productosPublicosCopia.find(
                  (item) => item.descuento
                ) && (
                  <li
                    onClick={() => {
                      filtrarSeccionOfertas();
                      setBusqueda("");
                    }}
                  >
                    Ofertas {`(${context.contadorOfert})`}{" "}
                  </li>
                )}

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
                <div className={style.movil__cat} onClick={mostrarMenu}>
                  <BiMenu className={style.cat__icon} /> <h3>Categorias</h3>
                </div>

                {showCategoria && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className={style.buscador}
                  >
                    <li
                      onClick={() => {
                        setProductosPublicos(context.productosPublicosCopia);
                        setBusqueda("");
                        mostrarMenu();
                      }}
                    >
                      Todo {`(${context.productosPublicosCopia.length})`}
                    </li>
                    {context.productosPublicosCopia.filter(
                      (item) => item.descuento
                    ) > 0 && (
                      <li
                        onClick={() => {
                          filtrarSeccionOfertas();
                          setBusqueda("");
                          mostrarMenu();
                        }}
                      >
                        Ofertas {`(${context.contadorOfert})`}{" "}
                      </li>
                    )}
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
                  </motion.div>
                )}
              </ul>
              <div className={style.tienda}>
                {context.productosPublicos.length != 0 ? (
                  <ProductosTienda productos={productosArray} />
                ) : (
                  <p className={style.tienda__p}>
                    No se encontraron productos 😓
                  </p>
                )}
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

export default User;
