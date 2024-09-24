import React, { useState, useEffect } from "react";
import imageCompression from "browser-image-compression";

import ImageKit from "imagekit";

function SubirFoto({ setImage, setLoad }) {
  const handleImageUpload = async (e) => {
    const imageFile = e.target.files[0];

    setLoad(false);

    console.log("originalFile instanceof Blob", imageFile instanceof Blob); // true
    console.log(`originalFile size ${imageFile.size / 1024 / 1024} MB`);

    // Convertir PNG a JPG optimizado
    let jpgFile = imageFile;
    if (imageFile.type === "image/png") {
      jpgFile = await convertPngToJpg(imageFile);
    }

    const options = {
      maxSizeMB: 0.04, // Cambiar a 0.06 para 60KB
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      initialQuality: 0.5, // Ajusta la calidad inicial si es necesario
    };

    try {
      const compressedFile = await imageCompression(jpgFile, options);

      console.log(
        "compressedFile instanceof Blob",
        compressedFile instanceof Blob
      ); // true
      console.log(
        `compressedFile size ${compressedFile.size / 1024 / 1024} MB`
      ); // tamaño comprimido

      await handleUploadServer(compressedFile); // Subir archivo comprimido

      setLoad(true);
    } catch (error) {
      console.log(error);
      setLoad(true); // Asegúrate de restablecer la carga en caso de error
    }
  };

  const convertPngToJpg = (pngFile) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(pngFile);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          // Convertir a JPG optimizado
          canvas.toBlob(
            (blob) => {
              const jpgFile = new File(
                [blob],
                pngFile.name.replace(/\.png$/, ".jpg"),
                {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                }
              );
              resolve(jpgFile);
            },
            "image/jpeg",
            0.8
          ); // Calidad del JPG (0.8 = 80%)
        };
      };
    });
  };

  const handleUploadServer = async (img) => {
    const imagekit = new ImageKit({
      publicKey: process.env.NEXT_PUBLIC_PUBLICKEY,
      privateKey: process.env.NEXT_PUBLIC_PRIVATEKEY,
      urlEndpoint: "https://ik.imagekit.io/myShop",
    });

    try {
      const response = await imagekit.upload({
        file: img,
        fileName: img.name, // Usa el nombre original del archivo
        tags: ["tag1"],
      });

      console.log("Imagen subida:", response);
      const imageUrl = response.url; // Obtén la URL de la imagen
      setImage(imageUrl); // Guarda la URL de la imagen subida
    } catch (error) {
      console.error("Error al subir la imagen:", error);
    }
  };

  // const uploadToServer = async (img) => {
  //   const url = `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB}&name=${img.name}`;
  //   const data = new FormData();
  //   data.append("image", img);

  //   try {
  //     const response = await fetch(url, {
  //       method: "POST",
  //       body: data,
  //     });

  //     const responseData = await response.json();

  //     // Do something with the response data

  //     setImage(responseData.data.url);

  //     return responseData;
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  return (
    <input
      type="file"
      name="imagen"
      onChange={handleImageUpload}
      style={{ border: "none", padding: "0" }}
    />
  );
}

export default SubirFoto;
