import React, { useContext } from "react";
import style from "./Suscripcion.module.scss";
import ContextGeneral from "@/servicios/contextPrincipal";

import { push } from "next/router";

function Suscripcion() {
  const context = useContext(ContextGeneral);

  return (
    <div className={style.main}>
      <div className={style.container}>
        <p
          className={style.tienda__activa}
          onClick={() =>
            context.premium.activo && push(`/u/${context.nombreTienda}`)
          }
          style={{ cursor: context.premium.activo && "pointer" }}
        >
          <span>Tienda publica:</span>{" "}
          {context.premium.activo ? (
            <span style={{ color: "green" }}>Activo</span>
          ) : (
            <span style={{ color: "red" }}>Desactivado</span>
          )}
        </p>
        <p className={style.info}>
          {">"} Si está activo tus clientes podran ver tu tienda en{" "}
          <span>www.myshop.com.ar/u/{context.nombreTienda}</span>
        </p>
        {context.premium.nivel == 0 ? (
          <a
            href="https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=2c938084843dc178018449db8fb70860"
            target="_blank"
          >
            Suscribirse a premium
          </a>
        ) : (
          <a
            href="https://www.mercadopago.com.ar/subscriptions#from-section=menu"
            target="_blank"
          >
            Configuracion de suscripcion
          </a>
        )}
      </div>
    </div>
  );
}

export default Suscripcion;
