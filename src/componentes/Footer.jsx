import React from "react";
import style from "../styles/Footer.module.scss";
import {
  AiOutlineInstagram,
  AiOutlineWhatsApp,
  AiOutlineMail,
  AiOutlinePhone,
} from "react-icons/ai";
import { FaMapMarkerAlt } from "react-icons/fa";

function Footer() {
  return (
    <footer className={style.container}>
      <div className={style.footer}>
        <div className={style.text}>
          <h3>MEDIOS DE PAGO</h3>
          <p>MercadoPago y Efectivo</p>
          <h3>MEDIOS DE ENVIOS</h3>
          <p>Pickup y Motomandado</p>
        </div>
        <div className={style.contacto}>
          <h3>NUESTRAS REDES SOCIALES</h3>
          <div className={style.icon__container}>
            <a href="">
              <AiOutlineInstagram className={style.icon} />
            </a>
            <a href="">
              <AiOutlineWhatsApp className={style.icon} />
            </a>
          </div>
          <h3>CONTACTO</h3>
          <div className={style.contacto__item}>
            <AiOutlineMail />
            <a href="">sras.medias22@gmail.com</a>
          </div>
          <div className={style.contacto__item}>
            <AiOutlinePhone />
            <a href="">3624148393</a>
          </div>
          <div className={style.contacto__item}>
            <FaMapMarkerAlt />{" "}
            <a href="">Catamarca 1326. Corrientes, Argentina</a>
          </div>
        </div>
      </div>
      <p className={style.p}>
        Hecho por{" "}
        <a href="https://www.sebassotelo.com.ar/" target={"_blank"}>
          Sebas Sotelo
        </a>{" "}
      </p>
    </footer>
  );
}

export default Footer;
