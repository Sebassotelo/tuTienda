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
  destacado2,
}) {
  const context = useContext(ContextGeneral);
  const { setProductos, setProductosCopia, llamadaDB } =
    useContext(ContextGeneral);

  const [descuentoActivo, setDescuentoActivo] = useState(descuento2);

  const dest = destacado2 ? destacado2 : false;
  const [destacadoActivo, setDestacadoActivo] = useState(dest);
  const [loadImg, setLoadImg] = useState(true);

  const [image, setImage] = useState(img2);

  const editarProducto = async (e) => {
    e.preventDefault(e);

    const title = e.target.inputTitle.value;
    const desc = e.target.inputDesc.value;
    const precio = e.target.inputPrecio.value;
    const stock = e.target.inputStock.value;
    const seccion = e.target.inputSeccion.value;
    const caracteristicas = e.target.inputCaracteristicas.value;
    // const descuento = descuentoActivo;
    const precioDescuento = e.target.inputPrecioDescuento.value;

    //filtramos la propiedad .items y creamos un array nuevo

    const nuevoProducto = {
      id: id2,
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
    };

    console.log("producto actu", nuevoProducto);

    // Aca copiamos el array original
    const productosCopia = [...context.productosCopia];
    const index = productosCopia.findIndex((item) => item.id === id2);

    // Aca copiamos el array mostrado
    const prodMostradosCopia = [...context.productos];
    const indexProdMostrados = prodMostradosCopia.findIndex(
      (item) => item.id === id2
    );

    // Actualizar la noticia en el array copiado
    productosCopia[index] = nuevoProducto;

    prodMostradosCopia[indexProdMostrados] = nuevoProducto;

    console.log("producto actu", productosCopia[index]);

    //seteamos el estado y updateamos la base de datos

    const docRef = doc(context.firestore, `users/${context.user.email}`);
    await updateDoc(docRef, { items: [...productosCopia] });

    // Seteamos los prod mostrados
    setProductos(prodMostradosCopia);

    // Seteamos el array original
    setProductosCopia(productosCopia);

    //limpiar Form
    e.target.inputTitle.value = "";
    e.target.inputDesc.value = "";
    e.target.inputPrecio.value = "";
    e.target.inputStock.value = "";
    e.target.inputSeccion.value = "";
    e.target.inputCaracteristicas.value = "";
    setImage("");
    // llamadaDB();
    toast.success("Cambio Guardado");
    setEditarProducto(false);
  };

  const activarDescuento = () => {
    setDescuentoActivo(!descuentoActivo);
  };
  const activarDestacado = () => {
    setDestacadoActivo(!destacadoActivo);
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
        <div className={style.precios}>
          <div className={style.precios__item}>
            <p>Precio:</p>
            <input
              type="number"
              name=""
              id="inputPrecio"
              defaultValue={precio2 ? precio2 : ""}
            />
          </div>
          <div className={style.precios__item}>
            <p>Precio oferta:</p>
            <input
              type="number"
              name=""
              id="inputPrecioDescuento"
              defaultValue={precioDescuento2 ? precioDescuento2 : ""}
            />
          </div>
          <div className={style.precios__item}>
            <p>Stock:</p>
            <input
              type="number"
              name=""
              id="inputStock"
              defaultValue={stock2 ? stock2 : ""}
            />
          </div>
        </div>

        <p>Categoría:</p>
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
        <p>Url de Imagen:</p>
        <SubirFoto setImage={setImage} setLoad={setLoadImg} />

        <div className={style.check__container}>
          <div className={style.checkbox}>
            <p>Descuento:</p>
            {descuentoActivo ? (
              <p
                className={style.descuentoActivo}
                style={{ border: "2px solid green" }}
                onClick={activarDescuento}
              >
                ON
              </p>
            ) : (
              <p
                className={style.descuentoActivo}
                style={{ border: "2px solid red" }}
                onClick={activarDescuento}
              >
                OFF
              </p>
            )}
          </div>
          <div className={style.checkbox}>
            <p>Destacado:</p>
            {destacadoActivo ? (
              <p
                onClick={activarDestacado}
                className={style.descuentoActivo}
                style={{ border: "2px solid green" }}
              >
                ON
              </p>
            ) : (
              <p
                onClick={activarDestacado}
                className={style.descuentoActivo}
                style={{ border: "2px solid red" }}
              >
                OFF
              </p>
            )}
          </div>
        </div>
        {image && (
          <div className={style.container__img}>
            <img src={image} alt="" />
          </div>
        )}

        <div className={style.container__botones}>
          <button onClick={setEditarProducto}>Cerrar</button>
          {loadImg ? (
            <button type="submit">Guardar</button>
          ) : (
            <button>Cargando Imagen...</button>
          )}
        </div>
      </form>
    </div>
  );
}

export default EditarProducto;
