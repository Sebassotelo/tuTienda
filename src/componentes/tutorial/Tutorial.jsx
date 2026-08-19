import React from "react";

function Tutorial({ setShow, url }) {
  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-zinc-950/70 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-2xl bg-white p-4 shadow-2xl shadow-zinc-950/30 sm:p-5">
        <div className="aspect-video overflow-hidden rounded-xl bg-zinc-950">
          <iframe
            className="h-full w-full"
            src={url}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          ></iframe>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => setShow(false)}
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-zinc-950 px-5 text-sm font-extrabold text-white transition hover:bg-zinc-800"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default Tutorial;
