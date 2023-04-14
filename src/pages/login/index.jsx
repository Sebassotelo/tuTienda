import React, { useContext } from "react";
import style from "../../styles/Login.module.scss";
import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import ContextGeneral from "@/servicios/contextPrincipal";

import { useEffect } from "react";

function Login() {
  const context = useContext(ContextGeneral);
  const { inspectorSesion } = useContext(ContextGeneral);
  const googleProvider = new GoogleAuthProvider();

  useEffect(() => {
    onAuthStateChanged(context.auth, inspectorSesion),
      console.log("estado", context.estadoUsuario);
  }, []);

  return (
    <div className={style.login__container}>
      <div>
        <p onClick={() => signInWithPopup(context.auth, googleProvider)}>
          Ingresar con Google
        </p>
        {context.user && (
          <p onClick={() => signOut(context.auth)}>Cerrar Sesion</p>
        )}
      </div>
    </div>
  );
}

export default Login;
