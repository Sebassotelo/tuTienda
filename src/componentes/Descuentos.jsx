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
      <div className={style.container__descuentos}>
        <div className={style.container__descuentos__item}>
          <p className={style.title}>Aplicar Descuentos:</p>
          <p>Elige la seccion:</p>
          <form action="" onSubmit={descuentoSeccion}>
            <select name="" id="inputSeccion">
              {context.secciones.map((item, i) => {
                return <option key={i}>{item}</option>;
              })}
            </select>

            <button type="submit">Aplicar Descuento</button>
          </form>
          <p
            className={style.descuento__seccion}
            onClick={descuentoTotal}
            style={{ backgroundColor: "green", width: "200px" }}
          >
            Aplicar Descuento a Todos los Productos
          </p>
        </div>

        <div className={style.container__descuentos__item}>
          <p className={style.title}>Quitar Descuentos:</p>
          <p>Elige la seccion:</p>
          <form action="" onSubmit={quitarDescuentoSeccion}>
            <select name="" id="inputSeccion">
              {context.secciones.map((item, i) => {
                return <option key={i}>{item}</option>;
              })}
            </select>

            <button type="submit">Quitar Descuento</button>
          </form>

          <p
            className={style.descuento__seccion}
            onClick={quitarDescuentoTotal}
            style={{ backgroundColor: "red", width: "200px" }}
          >
            Quitar Descuento a Todos los Productos
          </p>
        </div>
      </div>

      <div className={style.cupones__container}>
        <p className={style.title}>Cupones</p>

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
