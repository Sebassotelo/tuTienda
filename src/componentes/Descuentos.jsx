import React, { useState, useContext, useEffect } from "react";
import style from "../styles/Descuentos.module.scss";
import ContextGeneral from "@/servicios/contextPrincipal";
import { doc, getDoc, updateDoc } from "firebase/firestore";

function Descuentos() {
  const context = useContext(ContextGeneral);
  const { setProductos, setProductosCopia, setLoader } =
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
      const docRef = doc(context.firestore, `users/sebassotelo97@gmail.com`);

      let nuevoArray = context.productosCopia;

      for (let i = 0; i < nuevoArray.length; i++) {
        if (nuevoArray[i].seccion == seccion) {
          nuevoArray[i].descuento = true;
        }
      }

      await updateDoc(docRef, { items: [...nuevoArray] });

      setProductos(nuevoArray);
      setProductosCopia(nuevoArray);
      contadorProductosDescuento();
      setLoader(true);
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
      const docRef = doc(context.firestore, `users/sebassotelo97@gmail.com`);

      let nuevoArray = context.productosCopia;
      for (let i = 0; i < nuevoArray.length; i++) {
        if (nuevoArray[i].seccion == seccion) {
          nuevoArray[i].descuento = false;
        }
      }

      await updateDoc(docRef, { items: [...nuevoArray] });
      setProductos(nuevoArray);
      setProductosCopia(nuevoArray);
      contadorProductosDescuento();
      setLoader(true);
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
      const docRef = doc(context.firestore, `users/sebassotelo97@gmail.com`);

      let nuevoArray = context.productosCopia;

      for (let i = 0; i < nuevoArray.length; i++) {
        nuevoArray[i].descuento = true;
      }

      await updateDoc(docRef, { items: [...nuevoArray] });
      setProductos(nuevoArray);
      setProductosCopia(nuevoArray);
      contadorProductosDescuento();
      setLoader(true);
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
      const docRef = doc(context.firestore, `users/sebassotelo97@gmail.com`);

      let nuevoArray = context.productosCopia;

      for (let i = 0; i < nuevoArray.length; i++) {
        nuevoArray[i].descuento = false;
      }

      await updateDoc(docRef, { items: [...nuevoArray] });
      setProductos(nuevoArray);
      setProductosCopia(nuevoArray);
      contadorProductosDescuento();
      setLoader(true);
    }
  };

  const contadorProductosDescuento = () => {
    const nuevoArray = context.productos.filter((item) => item.descuento);
    setContadorProductos(nuevoArray.length);
  };

  useEffect(() => {
    contadorProductosDescuento();
  }, []);

  return (
    <div className={style.container}>
      <h3>Descuentos</h3>
      <p>
        Hay en descuento <span>{contadorProductos}</span> productos{" "}
      </p>
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
  );
}

export default Descuentos;
