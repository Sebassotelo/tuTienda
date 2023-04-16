import React, { useContext, useEffect, useState } from "react";
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

function EditarProducto({
  title2,
  desc2,
  precio2,
  img2,
  stock2,
  seccion2,
  caracteristicas2,
  id2,
  descuento2,
  precioDescuento2,
  setEditarProducto,
}) {
  const context = useContext(ContextGeneral);
  const { setProductos } = useContext(ContextGeneral);

  const [descuentoActivo, setDescuentoActivo] = useState(descuento2);

  const editarProducto = async (e) => {
    e.preventDefault(e);

    const title = e.target.inputTitle.value;
    const desc = e.target.inputDesc.value;
    const precio = e.target.inputPrecio.value;
    const img = e.target.inputImagen.value;
    const stock = e.target.inputStock.value;
    const seccion = e.target.inputSeccion.value;
    const caracteristicas = e.target.inputCaracteristicas.value;
    const descuento = descuentoActivo;
    const precioDescuento = e.target.inputPrecioDescuento.value;

    //filtramos la propiedad .items y creamos un array nuevo

    const nuevoProducto = {
      id: id2,
      title: title,
      stock: stock,
      precio: precio,
      desc: desc,
      seccion: seccion,
      img: img,
      caracteristicas: caracteristicas,
      descuento: descuentoActivo,
      precioDescuento: precioDescuento,
    };

    const productosCopia = [...context.productosCopia];
    const index = productosCopia.findIndex((item) => item.id === id2);

    // Actualizar la noticia en el array copiado
    productosCopia[index] = nuevoProducto;

    //seteamos el estado y updateamos la base de datos

    const docRef = doc(context.firestore, `users/sebassotelo97@gmail.com`);
    await updateDoc(docRef, { items: [...productosCopia] });
    setProductos(productosCopia);
    //limpiar Form
    e.target.inputTitle.value = "";
    e.target.inputDesc.value = "";
    e.target.inputPrecio.value = "";
    e.target.inputImagen.value = "";
    e.target.inputStock.value = "";
    e.target.inputSeccion.value = "";
    e.target.inputCaracteristicas.value = "";

    setEditarProducto(false);
  };

  const activarDescuento = () => {
    setDescuentoActivo(!descuentoActivo);
  };

  useEffect(() => {}, []);

  return (
    <div className={style.container}>
      <form action="" className={style.form} onSubmit={editarProducto}>
        <p>Titulo:</p>
        <input
          type="text"
          name=""
          id="inputTitle"
          defaultValue={title2 ? title2 : ""}
        />
        <p>Descripcion:</p>
        <input
          type="text"
          name=""
          id="inputDesc"
          defaultValue={desc2 ? desc2 : ""}
        />
        <p>Precio:</p>
        <input
          type="number"
          name=""
          id="inputPrecio"
          defaultValue={precio2 ? precio2 : ""}
        />
        <p>Url de Imagen:</p>
        <input
          type="text"
          name=""
          id="inputImagen"
          defaultValue={img2 ? img2 : ""}
        />
        <p>Stock:</p>
        <input
          type="number"
          name=""
          id="inputStock"
          defaultValue={stock2 ? stock2 : ""}
        />
        <p>Seccion:</p>
        <select
          name=""
          id="inputSeccion"
          defaultValue={seccion2 ? seccion2 : ""}
        >
          {context.secciones.map((item, i) => {
            return <option key={i}>{item}</option>;
          })}
        </select>
        <p>
          Caracteristicas: separar con comas y no dejar espacios entre las comas
          y las palabras{" "}
        </p>
        <input
          type="text"
          name=""
          id="inputCaracteristicas"
          defaultValue={caracteristicas2 ? caracteristicas2 : ""}
        />
        <div className={style.checkbox}>
          <p>Descuento Activo:</p>
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

        <p>Precio con Descuento:</p>
        <input
          type="number"
          name=""
          id="inputPrecioDescuento"
          defaultValue={precioDescuento2 ? precioDescuento2 : ""}
        />
        <button type="submit">Guardar</button>
        <button onClick={setEditarProducto}>Cerrar</button>
      </form>
    </div>
  );
}

export default EditarProducto;
