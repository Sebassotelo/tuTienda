import React, { useContext, useState } from "react";
import styles from "./Configuracion.module.scss";
import Perfil from "../perfil/Perfil";
import Form from "./form/Form";
import ContextGeneral from "@/servicios/contextPrincipal";

import { toast } from "sonner";

import {
  doc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

function Configuracion() {
  const [showForm, setShowForm] = useState(false);

  const context = useContext(ContextGeneral);
  const { llamadaDB } = useContext(ContextGeneral);

  const setearUsuario = async (e) => {
    e.preventDefault(e);

    if (
      confirm(
        `Quiere asignar ${e.target.inputUsuario.value} como nombre de la tienda?`
      ) === true
    ) {
      const usuario = e.target.inputUsuario.value.toLowerCase();

      let productosArrayOriginal;
      const docRefQuery = collection(context.firestore, `users`);
      const q = query(docRefQuery, where("usuario", "==", usuario));
      const fetchUsuarios = await getDocs(q);
      fetchUsuarios.forEach((doc) => (productosArrayOriginal = doc.data()));

      if (!productosArrayOriginal) {
        //traemos los datos de base de datos
        const docRef = doc(context.firestore, `users/${context.user.email}`);

        updateDoc(docRef, { usuario: usuario });

        toast.success(`Nombre de tienda asignada correctamente`);

        //limpiar Form
        e.target.inputUsuario.value = "";
        llamadaDB();
      } else {
        toast.success(`El nombre de la tienda no se encuentra disponible`);
      }
    }
  };

  return (
    <div className={styles.container}>
      <div>
        <Perfil configuracion={context.configuracion} />
      </div>

      <form action="" onSubmit={setearUsuario} className={styles.formUsuario}>
        <p>Nombre de Tienda:</p>
        <input
          type="text"
          name=""
          id="inputUsuario"
          defaultValue={context.nombreTienda}
        />
        <button type="submit">Guardar</button>
      </form>

      <button
        onClick={() => setShowForm(true)}
        className={styles.abrir__config}
      >
        Editar Configuracion
      </button>

      {showForm && <Form setShowForm={setShowForm} />}
    </div>
  );
}

export default Configuracion;
