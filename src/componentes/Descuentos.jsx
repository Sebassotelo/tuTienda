import React, { useState, useContext, useEffect } from "react";
import style from "../styles/Descuentos.module.scss";
import ContextGeneral from "@/servicios/contextPrincipal";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import ProductoPanel from "./ProductoPanel";
import Cupones from "./Cupones";

function Descuentos() {
  const context = useContext(ContextGeneral);
  const { setProductos, setProductosCopia, setLoader, setCupones, llamadaDB } =
    useContext(ContextGeneral);

  const [contadorProductos, setContadorProductos] = useState(0);

  const descuentoSeccion = async (e) => {
    e.preventDefault();
    const seccion = e.target.inputSeccion.value;
    if (
      confirm(
        `Seguro que desea activar el descuento a la seccion ${seccion}?`
      ) === true
    ) {
      setLoader(false);
      //traemos los datos de base de datos
      const docRef = doc(context.firestore, `users/${context.user.email}`);

      let nuevoArray = context.productosCopia;

      for (let i = 0; i < nuevoArray.length; i++) {
        if (nuevoArray[i].seccion == seccion) {
          nuevoArray[i].descuento = true;
        }
      }

      await updateDoc(docRef, { items: [...nuevoArray] });

      llamadaDB();
      contadorProductosDescuento();
    }
  };

  const quitarDescuentoSeccion = async (e) => {
    e.preventDefault();

    const seccion = e.target.inputSeccion.value;
    if (
      confirm(
        `Seguro que desea desactivar el descuento a la seccion ${seccion}?`
      ) === true
    ) {
      setLoader(false);
      //traemos los datos de base de datos
      const docRef = doc(context.firestore, `users/${context.user.email}`);

      let nuevoArray = context.productosCopia;
      for (let i = 0; i < nuevoArray.length; i++) {
        if (nuevoArray[i].seccion == seccion) {
          nuevoArray[i].descuento = false;
        }
      }

      await updateDoc(docRef, { items: [...nuevoArray] });
      llamadaDB();
      contadorProductosDescuento();
    }
  };

  const descuentoTotal = async () => {
    if (
      confirm(
        `Seguro que desea activar el descuento de todos los productos?`
      ) === true
    ) {
      setLoader(false);
      //traemos los datos de base de datos
      const docRef = doc(context.firestore, `users/${context.user.email}`);

      let nuevoArray = context.productosCopia;

      for (let i = 0; i < nuevoArray.length; i++) {
        nuevoArray[i].descuento = true;
      }

      await updateDoc(docRef, { items: [...nuevoArray] });
      llamadaDB();
      contadorProductosDescuento();
    }
  };
  const quitarDescuentoTotal = async () => {
    if (
      confirm(
        `Seguro que desea desactivar el descuento de todos los productos?`
      ) === true
    ) {
      setLoader(false);
      //traemos los datos de base de datos
      const docRef = doc(context.firestore, `users/${context.user.email}`);

      let nuevoArray = context.productosCopia;

      for (let i = 0; i < nuevoArray.length; i++) {
        nuevoArray[i].descuento = false;
      }

      await updateDoc(docRef, { items: [...nuevoArray] });
      llamadaDB();
      contadorProductosDescuento();
    }
  };

  const contadorProductosDescuento = () => {
    const nuevoArray = context.productosCopia.filter((item) => item.descuento);
    setContadorProductos(nuevoArray.length);
  };

  useEffect(() => {
    contadorProductosDescuento();
  }, []);

  return (
    <div className={style.container}>
      <h2>Descuentos</h2>
      <p className={style.info}>
        {">"} Desde esta sección podras configurar los descuentos y cupones de
        tu tienda.
      </p>
      {context.secciones.length > 0 && (
        <div className={style.container__descuentos}>
          <div className={style.container__descuentos__item}>
            <form action="" onSubmit={descuentoSeccion}>
              <p className={style.title}>
                Aplicar descuento a categoría completa.
              </p>
              <p>Elige la categoría:</p>
              <select name="" id="inputSeccion">
                {context.secciones.map((item, i) => {
                  return <option key={i}>{item}</option>;
                })}
              </select>

              <button type="submit">Aplicar descuento</button>
              <p className={style.info}>
                {">"} Con ésta función podrás activar el descuento de una sola
                categoría.
              </p>
            </form>
            <p
              className={style.descuento__seccion}
              onClick={descuentoTotal}
              style={{ border: "2px solid green" }}
            >
              Activar descuento a todos los productos
            </p>
            <p className={style.info}>
              {">"} Con ésta función podrás activar el descuento de todos los
              productos de la tienda.
            </p>
          </div>

          <div className={style.container__descuentos__item}>
            <form action="" onSubmit={quitarDescuentoSeccion}>
              <p className={style.title}>
                Quitar descuento a categoría completa.
              </p>
              <p>Elige la categoría:</p>
              <select name="" id="inputSeccion">
                {context.secciones.map((item, i) => {
                  return <option key={i}>{item}</option>;
                })}
              </select>

              <button type="submit">Quitar descuento</button>
              <p className={style.info}>
                {">"} Con ésta función podrás desactivar el descuento de una
                sola categoría.
              </p>
            </form>

            <p
              className={style.descuento__seccion}
              onClick={quitarDescuentoTotal}
              style={{
                border: "2px solid red",
              }}
            >
              Desactivar descuento a todos los productos
            </p>
            <p className={style.info}>
              {">"} Con ésta función podrás desactivar el descuento de todos los
              productos de la tienda.
            </p>
          </div>
        </div>
      )}

      <div className={style.cupones__container}>
        <p className={style.title}>Cupones</p>
        <p className={style.info}>
          {">"} Con ésta función podrás generar diferentes tipos de cupones de
          descuento.
        </p>

        <Cupones />
      </div>

      <div className={style.productos_descuentos}>
        <p>Productos en Descuento:</p>
        <p className={style.p__productos}>
          Hay en descuento <span>{contadorProductos}</span> productos{" "}
        </p>
        <div className={style.listaProducto}>
          {context.productosCopia
            .filter((item) => item.descuento)
            .map((item) => {
              return (
                <ProductoPanel
                  key={item.id}
                  title={item.title}
                  precio={item.precio}
                  desc={item.desc}
                  img={item.img}
                  stock={item.stock}
                  caracteristicas={item.caracteristicas}
                  id={item.id}
                  seccion={item.seccion}
                  descuento={item.descuento}
                  destacado={item.destacado}
                  precioDescuento={item.precioDescuento}
                />
              );
            })}
        </div>
      </div>
    </div>
  );
}

export default Descuentos;
