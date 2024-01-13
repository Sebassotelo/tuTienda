import React, { useContext, useState } from "react";
import styles from "./Configuracion.module.scss";
import Perfil from "../perfil/Perfil";
import Form from "./form/Form";
import ContextGeneral from "@/servicios/contextPrincipal";

import { doc, updateDoc } from "firebase/firestore";

function Configuracion() {
  const [showForm, setShowForm] = useState(false);

  const context = useContext(ContextGeneral);
  const { llamadaDB } = useContext(ContextGeneral);

  const setearUsuario = async (e) => {
    e.preventDefault(e);

    const usuario = e.target.inputUsuario.value;

    //traemos los datos de base de datos
    const docRef = doc(context.firestore, `users/${context.user.email}`);

    //filtramos la propiedad .items y creamos un array nuevo

    //seteamos el estado y updateamos la base de datos
    //   setArray(newArray);

    updateDoc(docRef, { usuario: usuario });

    // toast.success(`Perfil Configurado Correctamente`);

    //limpiar Form
    e.target.inputUsuario.value = "";
    llamadaDB();
  };

  return (
    <div className={styles.container}>
      <div>
        <Perfil configuracion={context.configuracion} />
      </div>

      <form action="" onSubmit={setearUsuario}>
        <p>Nombre de Tienda:</p>
        <input
          type="text"
          name=""
          id="inputUsuario"
          defaultValue={context.nombreTienda}
        />
        <button type="submit">Guardar</button>
      </form>

      <button onClick={() => setShowForm(true)}>Editar Configuracion</button>

      {showForm && <Form setShowForm={setShowForm} />}
    </div>
  );
}

export default Configuracion;
