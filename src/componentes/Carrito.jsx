import React, { useContext, useEffect, useState } from "react";
import style from "../styles/Carrito.module.scss";
import ContextGeneral from "@/servicios/contextPrincipal";
function Carrito({ showCarrito }) {
  const context = useContext(ContextGeneral);
  const { setCarrito, actualizacionCarrito } = useContext(ContextGeneral);
  const [precioFinal, setPrecioFinal] = useState(0);
  const [cantidadFinal, setCantidadFinal] = useState(0);
  const [pedido, setPedido] = useState();

  const [estadoPedido, setEstadoPedido] = useState(0);
  // 0 = nada
  // 1 = Realizar Pedido
  // 2 = Confirmar Pedido
  // 3 = Pedido Copiado

  const eliminarProducto = (id) => {
    const nuevoArray = context.carrito.filter((item, key) => item.id != id);
    setCarrito(nuevoArray);
    actualizacionCarrito();
  };

  let pedidoCopy = "";
  const confirmarPedido = () => {
    if (cantidadFinal > 0) {
      pedidoCopy = "";
      context.carrito.map(
        (e) =>
          (pedidoCopy =
            pedidoCopy +
            `${e.cantidad}X%20${e.title}%20-----%20$${
              e.precio * e.cantidad
            }%20%0A`)
      );
      setPedido(
        `Hola,%20te%20pido%20esto:%0A%0A${pedidoCopy}%0ATotal:%20$${precioFinal}`
      );

      navigator.clipboard.writeText(pedidoCopy);

      if (cantidadFinal > 0) {
        setEstadoPedido(2);
      }
    }
  };

  const sumarCantidad = (id) => {
    const nuevoArray = context.carrito;

    if (nuevoArray.find((e) => e.id === id)) {
      if (nuevoArray.find((e) => e.id === id).cantidad >= 0) {
        if (
          nuevoArray.find((e) => e.id === id).cantidad <=
          nuevoArray.find((e) => e.id === id).stock
        )
          nuevoArray.find((e) => e.id === id).cantidad += 1;
        setCarrito(nuevoArray);
        actualizacionCarrito();
      }
    }
  };
  const restarCantidad = (id) => {
    const nuevoArray = context.carrito;

    if (nuevoArray.find((e) => e.id === id)) {
      if (nuevoArray.find((e) => e.id === id).cantidad > 1) {
        nuevoArray.find((e) => e.id === id).cantidad -= 1;
        setCarrito(nuevoArray);
        actualizacionCarrito();
      }
    }
  };

  let precioTotal = 0;
  let cantidadTotal = 0;

  useEffect(() => {
    context.carrito.map((e, i) => {
      precioTotal = precioTotal + e.precio * e.cantidad;
      cantidadTotal = cantidadTotal + e.cantidad;
    });

    setPrecioFinal(precioTotal);
    setCantidadFinal(cantidadTotal);
    setEstadoPedido(0);
  }, [context.actuCarrito]);

  return (
    <div className={style.container}>
      <p onClick={() => showCarrito(false)} className={style.cerrar}>
        X
      </p>{" "}
      <div>
        <h4>Mi carrito</h4>
        <div className={style.lista__productos}>
          {context.carrito &&
            context.carrito.map((item) => {
              return (
                <div className={style.carrito__item} key={item.id}>
                  <div className={style.img}>
                    <img src={item.img} alt="" />
                  </div>
                  <div className={style.carrito__desc}>
                    <p className={style.carrito__title}>{item.title}</p>
                    <div className={style.carrito__cantidad}>
                      <p
                        className={style.icon}
                        onClick={() => restarCantidad(item.id)}
                      >
                        -
                      </p>
                      <p className={style.cant}>{item.cantidad}</p>
                      <p
                        className={style.icon}
                        onClick={() => sumarCantidad(item.id)}
                      >
                        +
                      </p>
                    </div>
                  </div>
                  <div className={style.carrito__precio}>
                    <p>${item.cantidad * item.precio}</p>
                    <span onClick={() => eliminarProducto(item.id)}>X</span>
                  </div>
                </div>
              );
            })}
        </div>
        <div className={style.precio__final}>
          <p>Total:</p>
          <p>${precioFinal}</p>
        </div>

        <div className={style.container__confirmacion}>
          {estadoPedido == 0 && (
            <div
              onClick={() => setEstadoPedido(1)}
              className={style.confirmacion}
            >
              <p>Realizar Pedido</p>
            </div>
          )}

          {estadoPedido == 1 && (
            <div onClick={confirmarPedido} className={style.confirmacion}>
              <p>Confirmar Pedido</p>
            </div>
          )}

          {estadoPedido == 2 && (
            <div
              className={style.confirmacion}
              style={{ backgroundColor: "green" }}
            >
              <a
                href={`https://api.whatsapp.com/send?phone=543794258393&text=${pedido}`}
                target={"_blank"}
              >
                Ir a WhatsApp
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Carrito;
