import React, { useContext, useState } from "react";
import styles from "./Configuracion.module.scss";
import ContextGeneral from "@/servicios/contextPrincipal";
import SubirFoto from "../SubirFoto";

import { toast } from "sonner";

import {
  doc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import Tutorial from "../tutorial/Tutorial";
import Suscripcion from "../suscripcion/Suscripcion";

function Configuracion() {
  const context = useContext(ContextGeneral);
  const { llamadaDB, setConfiguracion } = useContext(ContextGeneral);

  const [load, setLoad] = useState(true);
  const [image, setImage] = useState(() =>
    context.configuracion.logo ? context.configuracion.logo : ""
  );

  const [showTutorial, setShowTutorial] = useState(false);

  const setearUsuario = async (e) => {
    e.preventDefault(e);

    if (
      confirm(
        `Quiere asignar ${e.target.inputUsuario.value} como nombre de la tienda?`
      ) === true
    ) {
      const usuario = e.target.inputUsuario.value.toLowerCase();
      if (usuario.includes(" ")) {
        return toast.error(
          "El nombre de la tienda no puede contener espacios vacios"
        );
      }
      let productosArrayOriginal;
      const docRefQuery = collection(context.firestore, `users`);
      const q = query(docRefQuery, where("usuario", "==", usuario));
      const fetchUsuarios = await getDocs(q);
      fetchUsuarios.forEach((doc) => (productosArrayOriginal = doc.data()));

      if (!productosArrayOriginal) {
        //traemos los datos de base de datos
        const docRef = doc(context.firestore, `users/${context.user.email}`);

        updateDoc(docRef, { usuario: usuario });

        //limpiar Form
        e.target.inputUsuario.value = "";
        llamadaDB();
        toast.success(`Nombre de tienda asignada correctamente`);
      } else {
        toast.success(`El nombre de la tienda no se encuentra disponible`);
      }
    }
  };

  const aplicarConfiguracion = async (e) => {
    e.preventDefault(e);

    const instagram = e.target.inputInstagram.value;
    const whatsapp = e.target.inputWhatsapp.value;
    const slogan = e.target.inputSlogan.value;
    const maps = e.target.inputMaps.value;

    //traemos los datos de base de datos
    const docRef = doc(context.firestore, `users/${context.user.email}`);

    //filtramos la propiedad .items y creamos un array nuevo

    const newObject = {
      instagram: instagram,
      whatsapp: whatsapp,
      maps: maps,
      logo: image,
      slogan: slogan,
    };

    setConfiguracion(newObject);

    //seteamos el estado y updateamos la base de datos
    //   setArray(newArray);
    updateDoc(docRef, { configuracion: newObject });

    toast.success(`Perfil Configurado Correctamente`);

    //limpiar Form
    e.target.inputInstagram.value = "";
    e.target.inputWhatsapp.value = "";
    e.target.inputMaps.value = "";
    e.target.inputSlogan.value = "";
    setImage("");
    llamadaDB();
  };

  return (
    <div className={styles.container}>
      <div className={styles.head}>
        <h2>Configuracion General</h2>
        <button
          className={styles.btn__tutorial}
          onClick={() => setShowTutorial(true)}
        >
          Ver Tutorial
        </button>
      </div>

      <form action="" onSubmit={setearUsuario} className={styles.formUsuario}>
        <p>Nombre de la Tienda:</p>
        <input
          type="text"
          name=""
          id="inputUsuario"
          defaultValue={context.nombreTienda}
        />
        <button type="submit">Guardar </button>
        <p className={styles.info}>
          {">"} Este nombre se colocara en el link a tu tienda.
        </p>
      </form>

      {context.nombreTienda != "" && (
        <form className={styles.formConfig} onSubmit={aplicarConfiguracion}>
          {image && <img src={image} alt="" />}
          <p>Instagram:</p>
          <input
            type="text"
            id="inputInstagram"
            defaultValue={
              context.configuracion && context.configuracion.instagram
            }
          />
          <p className={styles.info}>
            {">"} Solo ingresa el nombre de usuario.
          </p>

          <p>Numero de Whatsapp: {"(sin 0 ni 15. Ej: 3794250000)"}</p>
          <input
            type="number"
            id="inputWhatsapp"
            defaultValue={
              context.configuracion && context.configuracion.whatsapp
            }
          />
          <p className={styles.info}>
            {">"} A este numero se enviaran los pedidos.
          </p>
          <p>Slogan:</p>
          <input
            type="text"
            id="inputSlogan"
            defaultValue={context.configuracion && context.configuracion.slogan}
          />
          <p>Link de Google Maps:</p>
          <input
            type="text"
            id="inputMaps"
            defaultValue={context.configuracion && context.configuracion.maps}
          />
          <p className={styles.info}>{">"} Link completo de Google Maps.</p>
          <p>Subir Logo: </p>
          <SubirFoto setImage={setImage} setLoad={setLoad} />
          {load ? (
            <button type="submit">Guardar</button>
          ) : (
            <button>Cargando imagen...</button>
          )}
        </form>
      )}

      <Suscripcion />

      {showTutorial && (
        <Tutorial
          setShow={setShowTutorial}
          url="https://www.youtube.com/embed/ex2jtR_GPnY?si=V5UkFWW5xSe-0YK6"
        />
      )}
    </div>
  );
}

export default Configuracion;
