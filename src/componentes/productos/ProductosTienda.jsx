import React, { useContext } from "react";
import style from "../../styles/ProductosTienda.module.scss";
import ContextGeneral from "@/servicios/contextPrincipal";
import ProductoItem from "./ProductoItem";
import BuscadorTienda from "../BuscadorTienda";

function ProductosTienda() {
  const context = useContext(ContextGeneral);

  return (
    <div className={style.container}>
      <BuscadorTienda />

      <div className={style.container__items}>
        {context.productosPublicos &&
          context.productosPublicos.map((item) => {
            return <ProductoItem key={item.id} item={item} />;
          })}
      </div>
    </div>
  );
}

export default ProductosTienda;
