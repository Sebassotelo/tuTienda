import React, { useContext, useEffect } from "react";
import ContextGeneral from "@/servicios/contextPrincipal";
import style from "../styles/ProductoNuevo.module.scss";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

function ProductoNuevo({ setShowNuevoProducto }) {
  const context = useContext(ContextGeneral);
  const { setProductos } = useContext(ContextGeneral);

  const agregarProducto = async (e) => {
    e.preventDefault(e);

    const title = e.target.inputTitle.value;
    const desc = e.target.inputDesc.value;
    const precio = e.target.inputPrecio.value;
    const img = e.target.inputImagen.value;
    const stock = e.target.inputStock.value;
    const seccion = e.target.inputSeccion.value;
    const caracteristicas = e.target.inputCaracteristicas.value;
    const descuento = e.target.inputDescuento.value;
    const precioDescuento = e.target.inputPrecioDescuento.value;
    const destacado = e.target.inputDestacado.value;

    //traemos los datos de base de datos
    const docRef = doc(context.firestore, `users/sebassotelo97@gmail.com`);
    const consulta = await getDoc(docRef);
    const infoDocu = consulta.data();

    //filtramos la propiedad .items y creamos un array nuevo

    const newArray = [];

    newArray.push(
      {
        id: new Date().getTime(),
        title: title,
        stock: stock,
        precio: precio,
        desc: desc,
        seccion: seccion,
        img: img,
        caracteristicas: caracteristicas,
        descuento: descuento,
        precioDescuento: precioDescuento,
        destacado: destacado,
      },
      ...infoDocu.items
    );

    setProductos(newArray);
    console.log("array", newArray);

    //seteamos el estado y updateamos la base de datos
    //   setArray(newArray);
    updateDoc(docRef, { items: [...newArray] });

    //limpiar Form
    e.target.inputTitle.value = "";
    e.target.inputDesc.value = "";
    e.target.inputPrecio.value = "";
    e.target.inputImagen.value = "";
    e.target.inputStock.value = "";
    e.target.inputSeccion.value = "";
    e.target.inputCaracteristicas.value = "";

    // setShow(false);
    setShowNuevoProducto(false);
  };

  return (
    <div className={style.container}>
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

        <p>Url de Imagen:</p>
        <input type="text" name="" id="inputImagen" />

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
            <p>Descuento Activo:</p>
            <input type="checkbox" id="inputDescuento" />
          </div>
          <div className={style.checkbox}>
            <p>Producto Destacado:</p>
            <input type="checkbox" id="inputDestacado" />
          </div>
        </div>

        <button type="submit">Agregar Producto</button>
        <button onClick={() => setShowNuevoProducto(false)}>Cerrar</button>
      </form>
    </div>
  );
}

export default ProductoNuevo;
