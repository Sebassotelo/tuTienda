import React, { useContext, useState } from "react";
import styles from "./Form.module.scss";

import ContextGeneral from "@/servicios/contextPrincipal";

import { doc, updateDoc } from "firebase/firestore";

import SubirFoto from "@/componentes/SubirFoto";

import { toast } from "sonner";

function Form({ setShowForm }) {
  const context = useContext(ContextGeneral);
  const { setConfiguracion, llamadaDB } = useContext(ContextGeneral);

  const [image, setImage] = useState(() =>
    context.configuracion.logo ? context.configuracion.logo : ""
  );
  const [load, setLoad] = useState(true);

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
      <form className={styles.form} onSubmit={aplicarConfiguracion}>
        {image && <img src={image} alt="" />}
        <p>Instagram:</p>
        <input
          type="text"
          id="inputInstagram"
          defaultValue={
            context.configuracion && context.configuracion.instagram
          }
        />
        <p>Numero de Whatsapp: {"(sin 0 ni 15. Ej: 3794250000)"}</p>
        <input
          type="number"
          id="inputWhatsapp"
          defaultValue={context.configuracion && context.configuracion.whatsapp}
        />
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
        <p>Subir Foto de perfil: </p>
        <SubirFoto setImage={setImage} setLoad={setLoad} />
        {load && <button type="submit">Guardar</button>}
        <button onClick={() => setShowForm(false)}>Cerrar</button>
      </form>
    </div>
  );
}

export default Form;
