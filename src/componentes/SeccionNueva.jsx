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
import { MdOutlineDeleteOutline } from "react-icons/md";
import { toast } from "sonner";
function SeccionNueva() {
  const context = useContext(ContextGeneral);
  const { setProductos, setProductosCopia, setSecciones } =
    useContext(ContextGeneral);

  const nuevaSeccion = async (e) => {
    e.preventDefault(e);

    let seccion = e.target.inputSeccion.value;

    //traemos los datos de base de datos
    const docRef = doc(context.firestore, `users/${context.user.email}`);
    const consulta = await getDoc(docRef);
    const infoDocu = consulta.data();

    const newArray = [];

    while (seccion.charAt(seccion.length - 1) === " ") {
      seccion = seccion.slice(0, -1);
    }
    newArray.push(seccion, ...infoDocu.secciones);

    await updateDoc(docRef, { secciones: [...newArray] });
    setSecciones(newArray);
    toast.success(`Se agrego correctamente la categoría ${seccion}`);
    e.target.inputSeccion.value = "";
  };

  const eliminarSeccion = async (id) => {
    if (confirm(`Seguro que desea eliminar la categoría ${id} ?`) === true) {
      const nuevoArray = context.secciones.filter((item) => item != id);

      const docRef = doc(context.firestore, `users/${context.user.email}`);
      await updateDoc(docRef, { secciones: [...nuevoArray] });
      setSecciones(nuevoArray);
      toast.success(`Se elimino correctamente la categoría ${id}`);
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
        <p className={style.lite}>
          {">"} En ésta sección podrás agregar las categorías para luego subir
          los productos en tu tienda online.
        </p>
        <p className={style.lite}>
          {">"} Recomendamos que los nombres de las categorías sean
          representativos y concisos para que tus clientes encuentren más rápido
          lo que necesitan.
        </p>
        <p>Nombre de la categoría nueva:</p>
        <input
          type="text"
          id="inputSeccion"
          placeholder="Ingrese el nombre de una categoría nueva"
        />
        <button type="submit">Agregar</button>
      </form>
      {context.secciones.length > 0 && <h4>Categorías Existentes:</h4>}
      <div className={style.secciones}>
        {context.secciones.map((item, i) => {
          return (
            <div className={style.secciones__item} key={i}>
              <p
                className={style.secciones__p}
                onClick={() => filtrarSeccion(item)}
              >
                {item}
              </p>
              <div className={style.x} onClick={() => eliminarSeccion(item)}>
                <MdOutlineDeleteOutline />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SeccionNueva;
