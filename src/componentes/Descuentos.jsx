import React, { useState, useContext, useEffect } from "react";
import style from "../styles/Descuentos.module.scss";
import ContextGeneral from "@/servicios/contextPrincipal";
import { doc, getDoc, updateDoc } from "firebase/firestore";

function Descuentos() {
  const context = useContext(ContextGeneral);
  const { setProductos, setProductosCopia } = useContext(ContextGeneral);

  const [contadorProductos, setContadorProductos] = useState(0);

  const descuentoSeccion = async (secc) => {
    if (
      confirm(`Seguro que desea activar el descuento a la seccion ${secc}?`) ===
      true
    ) {
      //traemos los datos de base de datos
      const docRef = doc(context.firestore, `users/sebassotelo97@gmail.com`);

      let nuevoArray = context.productosCopia;

      for (let i = 0; i < nuevoArray.length; i++) {
        if (nuevoArray[i].seccion == secc) {
          nuevoArray[i].descuento = true;
        }
      }

      await updateDoc(docRef, { items: [...nuevoArray] });

      setProductos(nuevoArray);
      setProductosCopia(nuevoArray);
      contadorProductosDescuento();
    }
  };

  const quitarDescuentoSeccion = async (secc) => {
    if (
      confirm(
        `Seguro que desea desactivar el descuento a la seccion ${secc}?`
      ) === true
    ) {
      //traemos los datos de base de datos
      const docRef = doc(context.firestore, `users/sebassotelo97@gmail.com`);

      let nuevoArray = context.productosCopia;
      for (let i = 0; i < nuevoArray.length; i++) {
        if (nuevoArray[i].seccion == secc) {
          nuevoArray[i].descuento = false;
        }
      }

      await updateDoc(docRef, { items: [...nuevoArray] });
      setProductos(nuevoArray);
      setProductosCopia(nuevoArray);
      contadorProductosDescuento();
    }
  };

  const descuentoTotal = async () => {
    if (
      confirm(
        `Seguro que desea activar el descuento de todos los productos?`
      ) === true
    ) {
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
    }
  };
  const quitarDescuentoTotal = async () => {
    if (
      confirm(
        `Seguro que desea desactivar el descuento de todos los productos?`
      ) === true
    ) {
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
      <p>Aplicar Descuentos en Seccion</p>
      <div className={style.aplicarDescSeccion}>
        {context.secciones.map((item, i) => {
          return (
            <p
              key={i}
              className={style.descuento__seccion}
              onClick={() => descuentoSeccion(item)}
            >
              {item}
            </p>
          );
        })}
      </div>

      <p>Quitar Descuentos en Seccion</p>
      <div className={style.aplicarDescSeccion}>
        {context.secciones.map((item, i) => {
          return (
            <p
              key={i}
              className={style.descuento__seccion}
              onClick={() => quitarDescuentoSeccion(item)}
            >
              {item}
            </p>
          );
        })}
      </div>

      <p
        className={style.descuento__seccion}
        onClick={descuentoTotal}
        style={{ backgroundColor: "green", width: "200px" }}
      >
        Aplicar Descuento Total
      </p>
      <p
        className={style.descuento__seccion}
        onClick={quitarDescuentoTotal}
        style={{ backgroundColor: "red", width: "200px" }}
      >
        Quitar Descuento Total
      </p>
    </div>
  );
}

export default Descuentos;
