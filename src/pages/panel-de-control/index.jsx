import ProductoNuevo from "@/componentes/ProductoNuevo";
import React, { useContext, useEffect, useState } from "react";
import style from "../../styles/PanelDeControlIndex.module.scss";
import ContextGeneral from "@/servicios/contextPrincipal";
import ProductoPanel from "@/componentes/ProductoPanel";
import SeccionNueva from "@/componentes/SeccionNueva";
import Head from "next/head";

import { onAuthStateChanged } from "firebase/auth";
import Descuentos from "@/componentes/Descuentos";
import BuscadorPanel from "@/componentes/BuscadorPanel";

import { push } from "next/router";
import Loader from "@/componentes/Loader";
import Configuracion from "@/componentes/configuracion/Configuracion";

import {
  MdOutlineDiscount,
  MdOutlineShoppingBasket,
  MdPerson,
  MdOutlineSettings,
} from "react-icons/md";
import Tutorial from "@/componentes/tutorial/Tutorial";

import ImageKit from "imagekit";
import imageCompression from "browser-image-compression";
import { doc, updateDoc } from "firebase/firestore";

function Index() {
  const context = useContext(ContextGeneral);
  const { llamadaDB, inspectorSesion, verificarLogin } =
    useContext(ContextGeneral);

  const [showSeccion, setShowSeccion] = useState(0);
  // 0 = Seccion Configuracion Perfil
  // 1 = Seccion Productos
  // 2 = Seccion Descuentos
  // 3 = Seccion Stock
  // 4 = Seccion Usuario

  const [showNuevoProducto, setShowNuevoProducto] = useState(false);

  const [showTutorial, setShowTutorial] = useState(false);

  const mostrarVentana = () => {
    setShowNuevoProducto(!showNuevoProducto);
    if (showNuevoProducto === true) {
      document.body.style.overflow = "";
    } else {
      document.body.style.overflow = "hidden";
    }
  };

  // const handleUploadImagesForProducts = async () => {
  //   const updatedProducts = await Promise.all(
  //     context.productos.map(async (product) => {
  //       try {
  //         // Verificar si la imagen proviene de i.ibb.co
  //         if (product.img.includes("i.ibb.co")) {
  //           // Hacer fetch a la imagen original
  //           const response = await fetch(product.img);
  //           const blob = await response.blob();

  //           // Convertir PNG a JPG si es necesario
  //           const jpgBlob = await convertToJpgIfNecessary(blob);

  //           // Comprimir la imagen
  //           const options = {
  //             maxSizeMB: 0.04, // Cambiar a 0.06 para 60KB
  //             maxWidthOrHeight: 1920,
  //             useWebWorker: true,
  //             initialQuality: 0.5, // Ajusta la calidad inicial si es necesario
  //           };
  //           const compressedFile = await imageCompression(jpgBlob, options);

  //           // Subir la imagen comprimida a ImageKit
  //           const imagekit = new ImageKit({
  //             publicKey: process.env.NEXT_PUBLIC_PUBLICKEY,
  //             privateKey: process.env.NEXT_PUBLIC_PRIVATEKEY,
  //             urlEndpoint: "https://ik.imagekit.io/myShop",
  //           });

  //           const uploadResponse = await imagekit.upload({
  //             file: compressedFile,
  //             fileName: product.title + ".jpg", // Nombre de archivo
  //             tags: ["tag1"],
  //           });

  //           console.log("PROD", `${product.title} Actualizado correctamente`);

  //           // Reemplazar la URL de la imagen en el producto
  //           return {
  //             ...product,
  //             img: uploadResponse.url, // Nueva URL de la imagen
  //           };
  //         } else {
  //           // Si no es de i.ibb.co, devolver el producto sin cambios
  //           return product;
  //         }
  //       } catch (error) {
  //         console.error(
  //           `Error procesando el producto: ${product.title}`,
  //           error
  //         );
  //         return product; // Devolver el producto sin cambios en caso de error
  //       }
  //     })
  //   );

  //   const docRef = doc(
  //     context.firestore,
  //     `users/valeriegissellevignau@gmail.com`
  //   );
  //   await updateDoc(docRef, { items: [...updatedProducts] });

  //   return updatedProducts; // Array de productos con las URLs actualizadas
  // };

  // const convertToJpgIfNecessary = async (blob) => {
  //   const imageType = blob.type;

  //   if (imageType === "image/png") {
  //     const img = new Image();
  //     img.src = URL.createObjectURL(blob);

  //     return new Promise((resolve) => {
  //       img.onload = () => {
  //         const canvas = document.createElement("canvas");
  //         canvas.width = img.width;
  //         canvas.height = img.height;

  //         const ctx = canvas.getContext("2d");
  //         ctx.drawImage(img, 0, 0);

  //         // Convertir a JPG y obtener el blob
  //         canvas.toBlob((jpgBlob) => {
  //           resolve(jpgBlob);
  //         }, "image/jpeg");
  //       };
  //     });
  //   } else {
  //     // Si ya es JPG o un tipo diferente, simplemente devuelve el blob original
  //     return blob;
  //   }
  // };

  useEffect(() => {
    verificarLogin();

    if (context.estadoUsuario == 0) {
      push("/");
    }
  }, []);
  return (
    <>
      <Head>
        <title> {context.nombreTienda} | Panel de Control</title>
      </Head>
      <div className={style.container}>
        {context.loader ? (
          <>
            {/* menu pc */}
            <div className={style.menu}>
              {context.nombreTienda && (
                <p>
                  <MdPerson /> u/{context.nombreTienda}
                </p>
              )}
              <li
                onClick={() => setShowSeccion(0)}
                style={{
                  color: showSeccion == 0 && "hsla(0, 57%, 55%, 1)",
                  marginLeft: showSeccion == 0 && "15px",
                }}
              >
                {" "}
                <MdOutlineSettings />
                Configuracion
              </li>
              <li
                onClick={() => setShowSeccion(1)}
                style={{
                  color: showSeccion == 1 && "hsla(0, 57%, 55%, 1)",
                  marginLeft: showSeccion == 1 && "15px",
                }}
              >
                {" "}
                <MdOutlineShoppingBasket />
                Productos
              </li>
              <li
                onClick={() => setShowSeccion(2)}
                style={{
                  color: showSeccion == 2 && "hsla(0, 57%, 55%, 1)",
                  marginLeft: showSeccion == 2 && "15px",
                }}
              >
                {" "}
                <MdOutlineDiscount />
                Descuentos
              </li>
            </div>

            {/* menu Movil */}
            <div className={style.menu__movil}>
              <li onClick={() => setShowSeccion(0)}>Configuracion</li>
              <li onClick={() => setShowSeccion(1)}>Productos</li>
              <li onClick={() => setShowSeccion(2)}>Descuentos</li>
            </div>
            <div className={style.secciones}>
              {showSeccion == 0 && <Configuracion />}
              {showSeccion == 1 && (
                <>
                  <div className={style.head}>
                    <h2>Productos</h2>
                    <button
                      className={style.btn__tutorial}
                      onClick={() => setShowTutorial(true)}
                    >
                      Ver Tutorial
                    </button>
                  </div>

                  {/* <button onClick={handleUploadImagesForProducts}>
                    ACTUALIZAR {context.productos.length} IMAGENES
                  </button> */}

                  <SeccionNueva />
                  {context.secciones.length > 0 ? (
                    <>
                      <p className={style.info}>
                        {">"} Los productos que tengan STOCK = 0 no se mostraran
                        en el catalogo publico {"<"}
                      </p>
                      <div className={style.cabecera__productos}>
                        <p
                          className={style.producto__nuevo__btn}
                          onClick={mostrarVentana}
                        >
                          Nuevo Producto
                        </p>
                        {context.productos.length > 0 && <BuscadorPanel />}
                      </div>

                      <div className={style.listaProducto}>
                        {showNuevoProducto && (
                          <ProductoNuevo
                            setShowNuevoProducto={mostrarVentana}
                          />
                        )}

                        {context.productos &&
                          context.productos.map((item) => {
                            return (
                              <>
                                {" "}
                                <ProductoPanel
                                  title={item.title}
                                  precio={item.precio}
                                  desc={item.desc}
                                  img={item.img}
                                  stock={item.stock}
                                  caracteristicas={item.caracteristicas}
                                  id={item.id}
                                  seccion={item.seccion}
                                  descuento={item.descuento}
                                  precioDescuento={item.precioDescuento}
                                  destacado={item.destacado}
                                />
                              </>
                            );
                          })}
                      </div>
                      {showTutorial && (
                        <Tutorial
                          url={
                            "https://www.youtube.com/embed/TKU37UBW5Io?si=Zo-mTJd3qJf-oH1I"
                          }
                          setShow={setShowTutorial}
                        />
                      )}
                    </>
                  ) : (
                    <p>Creá una categoria para poder agregar productos.</p>
                  )}
                </>
              )}
              {showSeccion == 2 && <Descuentos />}
            </div>
          </>
        ) : (
          <Loader />
        )}
      </div>
    </>
  );
}

export default Index;
