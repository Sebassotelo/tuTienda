import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  buildProductBatchData,
  canPublishStore,
  extractProductsFromBatchData,
  getMaxProducts,
  productBatchDocId,
  productFieldKey,
  splitProductsInBatches,
} from "./productosBatchCore";

export { canPublishStore, getMaxProducts } from "./productosBatchCore";

function sortProductsById(products) {
  return products.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
}

export async function getProductBatchDocsByAccount(firestore, email) {
  const q = query(collection(firestore, "productos"), where("cuenta", "==", email));
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((batchDoc) => ({ id: batchDoc.id, ref: batchDoc.ref, data: batchDoc.data() }))
    .sort((a, b) => Number(a.data.batchIndex || 0) - Number(b.data.batchIndex || 0));
}

export async function getProductBatchStateByAccount(firestore, email) {
  const docs = await getProductBatchDocsByAccount(firestore, email);
  const products = docs.flatMap((batchDoc) => extractProductsFromBatchData(batchDoc.data));

  return {
    exists: docs.length > 0,
    docs,
    products: sortProductsById(products),
  };
}

export async function getProductsByAccount(firestore, email) {
  const state = await getProductBatchStateByAccount(firestore, email);
  return state.products;
}

export async function getProductBatchStateByUsuario(firestore, usuario) {
  const q = query(collection(firestore, "productos"), where("usuario", "==", usuario));
  const snapshot = await getDocs(q);
  const docs = snapshot.docs.map((batchDoc) => ({
    id: batchDoc.id,
    ref: batchDoc.ref,
    data: batchDoc.data(),
  }));
  const products = docs.flatMap((batchDoc) => extractProductsFromBatchData(batchDoc.data));

  return {
    exists: docs.length > 0,
    docs,
    products: sortProductsById(products),
  };
}

export async function getProductsByUsuario(firestore, usuario) {
  const state = await getProductBatchStateByUsuario(firestore, usuario);
  return state.products;
}

export async function saveProductsForAccount({ firestore, email, usuario, products, premium }) {
  const maxProducts = getMaxProducts(premium);

  if (products.length > maxProducts) {
    throw new Error(`El plan actual permite hasta ${maxProducts} productos.`);
  }

  const existingDocs = await getProductBatchDocsByAccount(firestore, email);
  const chunks = splitProductsInBatches(products);
  const writes = chunks.map((chunk, batchIndex) => {
    const ref = doc(collection(firestore, "productos"), productBatchDocId(email, batchIndex));
    return setDoc(
      ref,
      buildProductBatchData({ email, usuario, batchIndex, products: chunk })
    );
  });

  const validIds = new Set(chunks.map((_, index) => productBatchDocId(email, index)));
  const deletes = existingDocs
    .filter((batchDoc) => !validIds.has(batchDoc.id))
    .map((batchDoc) => deleteDoc(batchDoc.ref));

  await Promise.all([...writes, ...deletes]);
}

export async function upsertProductForAccount({ firestore, email, usuario, product, fallbackProducts, premium }) {
  const docs = await getProductBatchDocsByAccount(firestore, email);
  const key = productFieldKey(product.id);
  const targetDoc = docs.find((batchDoc) => Object.prototype.hasOwnProperty.call(batchDoc.data, key));

  if (targetDoc) {
    await updateDoc(targetDoc.ref, {
      [key]: product,
      usuario: usuario || "",
      updatedAt: new Date().toISOString(),
    });
    return;
  }

  const products = fallbackProducts || [];
  await saveProductsForAccount({ firestore, email, usuario, products, premium });
}

export async function deleteProductForAccount({ firestore, email, productId, fallbackProducts, usuario, premium }) {
  const docs = await getProductBatchDocsByAccount(firestore, email);
  const key = productFieldKey(productId);
  const targetDoc = docs.find((batchDoc) => Object.prototype.hasOwnProperty.call(batchDoc.data, key));

  if (targetDoc) {
    await updateDoc(targetDoc.ref, {
      [key]: deleteField(),
      updatedAt: new Date().toISOString(),
    });
    return;
  }

  await saveProductsForAccount({ firestore, email, usuario, products: fallbackProducts || [], premium });
}

export async function updateProductsUsuarioForAccount(firestore, email, usuario) {
  const docs = await getProductBatchDocsByAccount(firestore, email);

  await Promise.all(
    docs.map((batchDoc) =>
      updateDoc(batchDoc.ref, {
        usuario: usuario || "",
        updatedAt: new Date().toISOString(),
      })
    )
  );
}
