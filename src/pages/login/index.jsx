import React, { useContext } from "react";
import style from "../../styles/Login.module.scss";
import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import ContextGeneral from "@/servicios/contextPrincipal";
import { FcGoogle } from "react-icons/fc";

import { useEffect } from "react";

function Login() {
  const context = useContext(ContextGeneral);
  const { verificarLogin, buscarOCrearUsuario } = useContext(ContextGeneral);
  const googleProvider = new GoogleAuthProvider();

  useEffect(() => {
    verificarLogin();
  }, []);

  return (
    <div className={style.login__container}>
      <div>
        {!context.user && (
          <p onClick={() => signInWithPopup(context.auth, googleProvider)}>
            <FcGoogle className={style.google} />
            Ingresar con Google
          </p>
        )}
        {context.user && (
          <p onClick={() => signOut(context.auth)}>Cerrar Sesion</p>
        )}
      </div>
    </div>
  );
}

export default Login;
