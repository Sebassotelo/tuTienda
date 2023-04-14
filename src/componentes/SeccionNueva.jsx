import React, { useContext, useEffect, useState } from "react";
import style from "../styles/SeccionNueva.module.scss";
import ContextGeneral from "@/servicios/contextPrincipal";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
function SeccionNueva() {
  const context = useContext(ContextGeneral);
  const { setProductos, setProductosCopia, setSecciones } =
    useContext(ContextGeneral);

  const nuevaSeccion = async (e) => {
    e.preventDefault(e);

    const seccion = e.target.inputSeccion.value;

    //traemos los datos de base de datos
    const docRef = doc(context.firestore, `users/sebassotelo97@gmail.com`);
    const consulta = await getDoc(docRef);
    const infoDocu = consulta.data();

    const newArray = [];

    newArray.push(seccion, ...infoDocu.secciones);

    await updateDoc(docRef, { secciones: [...newArray] });
    setSecciones(newArray);
    e.target.inputSeccion.value = "";
  };

  const eliminarSeccion = async (id) => {
    if (confirm(`Seguro que desea eliminarla seccion ${id} ?`) === true) {
      const nuevoArray = context.secciones.filter((item) => item != id);

      setSecciones(nuevoArray);

      const docRef = doc(context.firestore, `users/sebassotelo97@gmail.com`);
      await updateDoc(docRef, { secciones: [...nuevoArray] });
    }
  };

  const filtrarSeccion = (id) => {
    const nuevoArray = context.productosCopia.filter(
      (item) => item.seccion == id
    );
    setProductos(nuevoArray);
  };

  return (
    <div className={style.container}>
      <form action="" onSubmit={nuevaSeccion}>
        <p>Nombre de seccion:</p>
        <input
          type="text"
          id="inputSeccion"
          placeholder="Ingrese el nombre de una seccion nueva"
        />
        <button type="submit">Agregar Seccion</button>
      </form>
      <div className={style.secciones}>
        <p>Secciones Existentes:</p>
        {context.secciones.map((item) => {
          return (
            <>
              <p
                className={style.secciones__p}
                onClick={() => filtrarSeccion(item)}
              >
                {item}
              </p>
              <div className={style.x} onClick={() => eliminarSeccion(item)}>
                <p> x</p>
              </div>
            </>
          );
        })}
      </div>
    </div>
  );
}

export default SeccionNueva;
