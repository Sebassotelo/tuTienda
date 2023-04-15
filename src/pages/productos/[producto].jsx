import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import ContextGeneral from "@/servicios/contextPrincipal";
import style from "../../styles/ProductoView.module.scss";
import Link from "next/link";
import { BsCartPlus } from "react-icons/bs";
import Head from "next/head";

function ProductoRuta() {
  const router = useRouter();
  const context = useContext(ContextGeneral);
  const {
    llamadaDB,
    setProductos,
    setCarrito,
    actualizacionCarrito,
    setProductosPublicos,
  } = useContext(ContextGeneral);

  const [producto, setProducto] = useState({});

  const filtrarProducto = () => {
    const prod = context.productosCopia.filter(
      (item) => item.id == router.query.producto
    );
    setProducto(prod[0]);
  };

  const filtrarSeccion = () => {
    const nuevoArray = context.productosPublicosCopia.filter(
      (item) => item.seccion == producto.seccion
    );
    setProductosPublicos(nuevoArray);
  };

  const agregarCarrito = () => {
    const nuevoArray = context.carrito;

    if (nuevoArray.find((e) => e.id === producto.id)) {
      if (
        nuevoArray.find((e) => e.id === producto.id).cantidad <
        nuevoArray.find((e) => e.id === producto.id).stock
      ) {
        nuevoArray.find((e) => e.id === producto.id).cantidad += 1;
        setCarrito(nuevoArray);
        actualizacionCarrito();
      }
    } else {
      let prec;
      if (producto.descuento) {
        prec = producto.precioDescuento;
      } else {
        prec = producto.precio;
      }
      const itemCarrito = {
        title: producto.title,
        precio: prec,
        img: producto.img,
        stock: producto.stock,
        id: producto.id,
        cantidad: 1,
      };
      setCarrito((prev) => [...prev, itemCarrito]);
      actualizacionCarrito();
    }

    console.log(nuevoArray);
  };

  useEffect(() => {
    llamadaDB();
    filtrarProducto();
  }, [context.loader]);

  return (
    <>
      <Head>
        <title>SrasMedias 🧦 | {producto.title}</title>
      </Head>
      <div className={style.container}>
        <div className={style.container__item}>
          <div className={style.img}>
            {" "}
            <img src={producto.img} alt="" />
          </div>
          <div className={style.text}>
            <p>
              <Link href={"/productos"}>Inicio</Link> /{" "}
              <Link href={"/productos"} onClick={filtrarSeccion}>
                {producto.seccion}
              </Link>{" "}
              / {producto.title}
            </p>
            <h3>{producto.title}</h3>
            {producto.descuento ? (
              <div className={style.precio__container}>
                <p
                  className={style.precio}
                  style={{ textDecoration: "line-through", color: "grey" }}
                >
                  ${producto.precio}
                </p>
                <p className={style.precio}>${producto.precioDescuento}</p>
              </div>
            ) : (
              <p className={style.precio}>${producto.precio}</p>
            )}
            <p>Stock: {producto.stock}</p>
            <p>{producto.desc}</p>

            {producto.stock > 0 && (
              <div className={style.agregarCarrito} onClick={agregarCarrito}>
                <p>Agregar al Carrito</p>
                <BsCartPlus className={style.icon} />
              </div>
            )}
            <div className={style.info}>
              <h4>ENVIOS</h4>
              <p>⚡P I C K U P ⚡ </p>
              <p>Envios por motomandados </p>
              <h4>METODOS DE PAGO</h4>
              <p>MercadoPago, Efectivo</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductoRuta;
