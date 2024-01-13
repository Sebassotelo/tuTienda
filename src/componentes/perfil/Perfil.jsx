import React, { useContext } from "react";
import styles from "./Perfil.module.scss";
import ContextGeneral from "@/servicios/contextPrincipal";

import {
  AiOutlineInstagram,
  AiOutlineWhatsApp,
  AiOutlinePhone,
} from "react-icons/ai";
import { FaMapMarkerAlt } from "react-icons/fa";

function Perfil({ configuracion }) {
  const context = useContext(ContextGeneral);
  return (
    <div className={styles.container}>
      {configuracion && (
        <img src={context.configuracion.logo} alt="" className={styles.foto} />
      )}

      <h3 className={styles.titulo}>@{context.nombreTienda}</h3>

      <div className={styles.redes}>
        {context.configuracion.instagram && (
          <a
            href={`https://www.instagram.com/${context.configuracion.instagram}/`}
            target="_blank"
          >
            <AiOutlineInstagram className={styles.logo} />
          </a>
        )}
        {context.configuracion.whatsapp && (
          <a
            href={`https://api.whatsapp.com/send/?phone=549${context.configuracion.whatsapp}&type=phone_number&app_absent=0`}
            target="_blank"
          >
            <AiOutlineWhatsApp className={styles.logo} />
          </a>
        )}
        {context.configuracion.maps && (
          <a href={context.configuracion.maps} target="_blank">
            <FaMapMarkerAlt className={styles.logo} />
          </a>
        )}
      </div>
    </div>
  );
}

export default Perfil;
