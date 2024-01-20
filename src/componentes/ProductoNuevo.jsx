import React, { useContext, useEffect, useState } from "react";
import ContextGeneral from "@/servicios/contextPrincipal";
import style from "../styles/ProductoNuevo.module.scss";
import { toast } from "sonner";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import SubirFoto from "./SubirFoto";

function ProductoNuevo({ setShowNuevoProducto }) {
  const [image, setImage] = useState("");
  const [descuentoActivo, setDescuentoActivo] = useState(false);
  const [destacadoActivo, setDestacadoActivo] = useState(false);
  const [loadImg, setLoadImg] = useState(true);

  const context = useContext(ContextGeneral);
  const { setProductos, setProductosCopia, llamadaDB } =
    useContext(ContextGeneral);

  const agregarProducto = async (e) => {
    e.preventDefault(e);

    let title = e.target.inputTitle.value;
    let desc = e.target.inputDesc.value;
    const precio = e.target.inputPrecio.value;
    const stock = e.target.inputStock.value;
    let seccion = e.target.inputSeccion.value;
    let caracteristicas = e.target.inputCaracteristicas.value;
    const precioDescuento = e.target.inputPrecioDescuento.value;

    // Corroboramos que en los textos no haya & para no tener error al enviar mensaje por wpp
    if (
      title.includes("&") ||
      desc.includes("&") ||
      seccion.includes("&") ||
      caracteristicas.includes("&")
    ) {
      title = title.replace(/&/g, "y");
      desc = desc.replace(/&/g, "y");
      seccion = seccion.replace(/&/g, "y");
      caracteristicas = caracteristicas.replace(/&/g, "y");
    }

    //traemos los datos de base de datos
    const docRef = doc(context.firestore, `users/${context.user.email}`);
    const consulta = await getDoc(docRef);
    const infoDocu = consulta.data();

    // Creamos el array que vamos a seter en db

    const newArray = [];

    newArray.push(
      {
        id: new Date().getTime(),
        title: title,
        stock: stock,
        precio: precio,
        desc: desc,
        seccion: seccion,
        img: image,
        caracteristicas: caracteristicas,
        descuento: descuentoActivo,
        precioDescuento: precioDescuento,
        destacado: destacadoActivo,
      },
      ...infoDocu.items
    );

    // Corroboramos el nivel de premium y vemos si no alcanzo la cantidad maxima de productos.

    if (context.premium.nivel == 1) {
      if (newArray.length < 30) {
        setProductos(newArray);
        setProductosCopia(newArray);
        //seteamos el estado y updateamos la base de datos
        updateDoc(docRef, { items: [...newArray] });
        toast.success(`${title} Agregado con exito `);
        llamadaDB();
      } else {
        toast.error(`Ha alcanzado el limite de productos`);
      }
    } else if (context.premium.nivel == 2) {
      if (newArray.length < 60) {
        setProductos(newArray);
        setProductosCopia(newArray);
        //seteamos el estado y updateamos la base de datos
        updateDoc(docRef, { items: [...newArray] });
        toast.success(`${title} Agregado con exito`);
        llamadaDB();
      } else {
        toast.error(`Ha alcanzado el limite de productos`);
      }
    } else if (context.premium.nivel == 3) {
      if (newArray.length < 100) {
        setProductos(newArray);
        setProductosCopia(newArray);
        //seteamos el estado y updateamos la base de datos
        updateDoc(docRef, { items: [...newArray] });
        toast.success(`${title} Agregado con exito`);
        llamadaDB();
      } else {
        toast.error(`Ha alcanzado el limite de productos`);
      }
    } else if (context.premium.nivel == 0) {
      toast.error(`No tiene premium activo`);
    }

    //limpiar Form
    e.target.inputTitle.value = "";
    e.target.inputDesc.value = "";
    e.target.inputPrecio.value = "";
    e.target.inputStock.value = "";
    e.target.inputSeccion.value = "";
    e.target.inputCaracteristicas.value = "";
    setImage("");

    // setShow(false);
    setShowNuevoProducto(false);
  };

  const activarDescuento = () => {
    setDescuentoActivo(!descuentoActivo);
  };
  const activarDestacado = () => {
    setDestacadoActivo(!destacadoActivo);
  };

  return (
    <div className={style.container}>
      {image && (
        <div className={style.container__img}>
          <img src={image} alt="" />
        </div>
      )}
      <form action="" className={style.form} onSubmit={agregarProducto}>
        <p>Nombre del Producto:</p>
        <input type="text" name="" id="inputTitle" />
        <p>Descripcion:</p>
        <input type="text" name="" id="inputDesc" />
        <div className={style.precios}>
          <div className={style.precios__item}>
            <p>Precio:</p>
            <input type="number" name="" id="inputPrecio" />
          </div>
          <div className={style.precios__item}>
            <p>Precio oferta:</p>
            <input type="number" name="" id="inputPrecioDescuento" />
          </div>
          <div className={style.precios__item}>
            <p>Stock:</p>
            <input type="number" name="" id="inputStock" />
          </div>
        </div>
        <p>Subir Imagen:</p>

        <SubirFoto setImage={setImage} setLoad={setLoadImg} />
        {/* <p>Url de Imagen:</p>
        <input type="text" name="" id="inputImagen" /> */}
        <p>Categoría del producto ​ :</p>
        <select name="" id="inputSeccion">
          {context.secciones.map((item, i) => {
            return <option key={i}>{item}</option>;
          })}
        </select>
        <p>
          Caracteristicas: separar con comas y no dejar espacios entre las comas
          y las palabras{" "}
        </p>
        <input type="text" name="" id="inputCaracteristicas" />
        <div className={style.check__container}>
          <div className={style.checkbox}>
            <p>Descuento:</p>
            {descuentoActivo ? (
              <p
                className={style.descuentoActivo}
                onClick={activarDescuento}
                style={{ backgroundColor: "green" }}
              >
                ON
              </p>
            ) : (
              <p
                className={style.descuentoActivo}
                onClick={activarDescuento}
                style={{ backgroundColor: "red" }}
              >
                OFF
              </p>
            )}
          </div>

          <div className={style.checkbox}>
            <p>Desctacado:</p>
            {destacadoActivo ? (
              <p
                className={style.descuentoActivo}
                onClick={activarDestacado}
                style={{ backgroundColor: "green" }}
              >
                ON
              </p>
            ) : (
              <p
                className={style.descuentoActivo}
                onClick={activarDestacado}
                style={{ backgroundColor: "red" }}
              >
                OFF
              </p>
            )}
          </div>
        </div>
        {loadImg ? (
          <button type="submit">Agregar Producto</button>
        ) : (
          <button>Cargando Imagen...</button>
        )}
        <button onClick={() => setShowNuevoProducto(false)}>Cerrar</button>
      </form>
    </div>
  );
}

export default ProductoNuevo;
