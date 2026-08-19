import React, { useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import ContextGeneral from "@/servicios/contextPrincipal";
import ProductoItem from "./ProductoItem";
import Popup from "./popup/Popup";
import BuscadorTienda from "@/componentes/BuscadorTienda";
import { toast } from "sonner";
import {
  MdOutlineDeleteOutline,
  MdKeyboardArrowRight,
  MdKeyboardArrowLeft,
} from "react-icons/md";

const getPrecioVenta = (producto) =>
  Number(producto.descuento ? producto.precioDescuento : producto.precio) || 0;

function ProductosTienda() {
  const context = useContext(ContextGeneral);
  const {
    setProductosPublicos,
    setBusqueda,
    setCarrito,
    actualizacionCarrito,
  } = useContext(ContextGeneral);

  const router = useRouter();
  const [numeroPagina, setNumeroPagina] = useState(0);
  const [orden, setOrden] = useState("destacados");

  const productosOrdenados = useMemo(() => {
    const productos = [...context.productosPublicos];

    return productos.sort((a, b) => {
      if (orden === "precio-menor") return getPrecioVenta(a) - getPrecioVenta(b);
      if (orden === "precio-mayor") return getPrecioVenta(b) - getPrecioVenta(a);
      if (orden === "nombre-az") return (a.title || "").localeCompare(b.title || "");
      if (orden === "nombre-za") return (b.title || "").localeCompare(a.title || "");
      if (orden === "ofertas") return Number(Boolean(b.descuento)) - Number(Boolean(a.descuento));

      return Number(Boolean(b.destacado)) - Number(Boolean(a.destacado));
    });
  }, [context.productosPublicos, orden]);

  const selectedProductId = Array.isArray(router.query.producto)
    ? router.query.producto[0]
    : router.query.producto;

  const selectedProduct = useMemo(() => {
    if (!selectedProductId) return null;

    return (
      context.productosPublicosCopia.find(
        (producto) => String(producto.id) === String(selectedProductId)
      ) || null
    );
  }, [context.productosPublicosCopia, selectedProductId]);

  const [productosMostrar, setProductosMostrar] = useState(
    productosOrdenados.slice(0, 12)
  );

  const limpiar = () => {
    setProductosPublicos(context.productosPublicosCopia);
    setBusqueda("");
  };

  const openProductModal = (producto) => {
    if (!producto?.id) return;

    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, producto: String(producto.id) },
      },
      undefined,
      { shallow: true, scroll: false }
    );
  };

  const closeProductModal = () => {
    const { producto, ...nextQuery } = router.query;

    router.push(
      {
        pathname: router.pathname,
        query: nextQuery,
      },
      undefined,
      { shallow: true, scroll: false }
    );
  };

  const agregarProductoCarrito = (producto) => {
    const productoExistente = context.carrito.find((item) => item.id === producto.id);

    if (productoExistente) {
      if (productoExistente.cantidad >= productoExistente.stock) {
        toast.error("No hay stock suficiente para agregar esa cantidad al carrito");
        return;
      }

      const carritoActualizado = context.carrito.map((item) =>
        item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
      );

      setCarrito(carritoActualizado);
      actualizacionCarrito();
      toast.success(`${producto.title} Agregado al carrito`);
      return;
    }

    const itemCarrito = {
      title: producto.title,
      precio: producto.descuento ? producto.precioDescuento : producto.precio,
      id: producto.id,
      img: producto.img,
      stock: producto.stock,
      cantidad: 1,
      seccion: producto.seccion,
    };

    setCarrito((prev) => [...prev, itemCarrito]);
    actualizacionCarrito();
    toast.success(`${producto.title} Agregado al carrito`);
  };

  const paginaSiguiente = () => {
    const totalElementos = productosOrdenados.length;
    const nextPage = numeroPagina + 1;
    const index = nextPage * 12;

    if (totalElementos <= index) return;

    setProductosMostrar(productosOrdenados.slice(index, index + 12));
    setNumeroPagina(nextPage);
    window.scroll(0, 0);
  };

  const paginaAnterior = () => {
    const prevPage = numeroPagina - 1;

    if (prevPage < 0) return;

    const index = prevPage * 12;
    setProductosMostrar(productosOrdenados.slice(index, index + 12));
    setNumeroPagina(prevPage);
    window.scroll(0, 0);
  };

  useEffect(() => {
    setProductosMostrar(productosOrdenados.slice(0, 12));
    setNumeroPagina(0);
  }, [productosOrdenados]);

  useEffect(() => {
    document.body.style.overflow = selectedProduct ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedProduct]);

  return (
    <>
      <div className="grid min-w-0 gap-4 overflow-hidden">
        <div
          id="catalog-search-section"
          className="grid min-w-0 gap-4 border-b border-zinc-100 pb-4 lg:grid-cols-[minmax(0,1fr)_minmax(480px,640px)] lg:items-start"
        >
          <div className="min-w-0">
            <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-coral">
              Productos
            </p>
            <h2 className="m-0 mt-1 font-display text-[1.65rem] font-bold leading-tight text-zinc-950">
              {context.productosPublicos.length} disponibles
            </h2>
          </div>

          <div className="grid min-w-0 gap-2">
            <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_8.75rem]">
              <BuscadorTienda />

              <label className="grid min-w-0 gap-1">
                <span className="sr-only">Ordenar por</span>
                <select
                  value={orden}
                  onChange={(event) => setOrden(event.target.value)}
                  className="min-h-[48px] w-full cursor-pointer rounded-xl border border-zinc-200 bg-slate-50 px-3 text-xs font-semibold text-zinc-500 outline-none transition hover:border-zinc-300 hover:bg-white focus:border-zinc-300 focus:bg-white focus:text-zinc-800 focus:ring-2 focus:ring-zinc-100"
                >
                  <option value="destacados">Destacados</option>
                  <option value="ofertas">Ofertas primero</option>
                  <option value="precio-menor">Menor precio</option>
                  <option value="precio-mayor">Mayor precio</option>
                  <option value="nombre-az">Nombre A-Z</option>
                  <option value="nombre-za">Nombre Z-A</option>
                </select>
              </label>
            </div>

            {(context.busqueda !== "" ||
              context.productosPublicos.length !== context.productosPublicosCopia.length) && (
              <button
                type="button"
                onClick={limpiar}
                className="inline-flex min-h-[40px] w-fit max-w-full cursor-pointer items-center justify-center gap-2 truncate rounded-xl border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-800 transition hover:bg-slate-50"
              >
                {context.busqueda !== "" ? context.busqueda : "Limpiar filtro"}
                <MdOutlineDeleteOutline className="text-lg" />
              </button>
            )}
          </div>
        </div>

        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start gap-x-2.5 gap-y-3 pr-1 sm:gap-4 sm:pr-0 lg:grid-cols-3 xl:grid-cols-4">
          {productosMostrar.map((item) => (
            <ProductoItem key={item.id} item={item} onOpenProduct={openProductModal} />
          ))}
        </div>

        {context.productosPublicos.length > 12 && (
          <div className="mx-auto flex items-center gap-3 rounded-2xl border border-zinc-200 bg-slate-50 p-2">
            <button
              type="button"
              onClick={paginaAnterior}
              className="grid h-10 w-10 place-items-center rounded-xl bg-zinc-950 text-xl text-white cursor-pointer transition hover:bg-zinc-800"
              aria-label="Pagina anterior"
            >
              <MdKeyboardArrowLeft />
            </button>
            <p className="m-0 min-w-8 text-center font-display text-xl font-bold text-zinc-950">
              {numeroPagina + 1}
            </p>
            <button
              type="button"
              onClick={paginaSiguiente}
              className="grid h-10 w-10 place-items-center rounded-xl bg-zinc-950 text-xl text-white cursor-pointer transition hover:bg-zinc-800"
              aria-label="Pagina siguiente"
            >
              <MdKeyboardArrowRight />
            </button>
          </div>
        )}
      </div>

      {selectedProduct && (
        <Popup
          setShow={closeProductModal}
          item={selectedProduct}
          agregarCarrito={() => agregarProductoCarrito(selectedProduct)}
        />
      )}
    </>
  );
}

export default ProductosTienda;