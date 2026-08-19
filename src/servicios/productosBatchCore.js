export const PRODUCT_BATCH_SIZE = 100;
export const PRODUCT_META_FIELDS = new Set([
  "cuenta",
  "usuario",
  "batchIndex",
  "createdAt",
  "updatedAt",
  "migratedAt",
  "source",
]);

export function productFieldKey(id) {
  return String(id);
}

export function safeAccountKey(email = "") {
  return String(email).toLowerCase().replace(/[^a-z0-9_-]/g, "_");
}

export function productBatchDocId(email, batchIndex) {
  return `${safeAccountKey(email)}_batch_${batchIndex}`;
}

export function parseSubscriptionDate(value) {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isSubscriptionExpired(premium = {}, now = new Date()) {
  const expiresAt = parseSubscriptionDate(premium?.fechaVencimiento);

  if (!expiresAt) return false;

  return expiresAt.getTime() < now.getTime();
}

export function hasActivePaidPlan(premium = {}) {
  return (
    premium?.activo !== false &&
    Number(premium?.nivel || 0) > 0 &&
    !isSubscriptionExpired(premium)
  );
}

export function getPlanKey(premium = {}) {
  if (!hasActivePaidPlan(premium)) return "free";

  const nivel = Number(premium?.nivel || 0);

  if (nivel >= 2) return "pro";
  if (nivel === 1) return "premium";
  return "free";
}

export function canPublishStore(premium = {}) {
  return hasActivePaidPlan(premium);
}

export function getMaxProductBatches(premium = {}) {
  if (getPlanKey(premium) === "pro") return Infinity;
  if (getPlanKey(premium) === "premium") return 1;
  return 0;
}

export function getMaxProducts(premium = {}) {
  const batches = getMaxProductBatches(premium);
  return Number.isFinite(batches) ? batches * PRODUCT_BATCH_SIZE : Infinity;
}

export function getPlanDisplayName(premium = {}) {
  const nivel = Number(premium?.nivel || 0);

  if (nivel >= 2) return "Pro";
  if (nivel === 1) return "Premium";
  return "Free";
}

export function getPlanLimitLabel(premium = {}) {
  const nivel = Number(premium?.nivel || 0);

  if (nivel >= 2) return "Productos sin limite";
  if (nivel === 1) return "Hasta 100 productos";
  return "Sin tienda publica";
}

export function getSubscriptionDaysLeft(premium = {}) {
  const expiresAt = parseSubscriptionDate(premium?.fechaVencimiento);

  if (!expiresAt) return null;

  const diff = expiresAt.getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function extractProductsFromBatchData(data = {}) {
  return Object.entries(data)
    .filter(([key, value]) => !PRODUCT_META_FIELDS.has(key) && value && typeof value === "object")
    .map(([key, value]) => ({ ...value, id: value.id ?? key }));
}

export function buildProductBatchData({ email, usuario, batchIndex, products }) {
  return products.reduce(
    (acc, product) => {
      acc[productFieldKey(product.id)] = product;
      return acc;
    },
    {
      cuenta: email,
      usuario: usuario || "",
      batchIndex,
      updatedAt: new Date().toISOString(),
      source: "productos-batcheados",
    }
  );
}

export function splitProductsInBatches(products = []) {
  const batches = [];

  for (let index = 0; index < products.length; index += PRODUCT_BATCH_SIZE) {
    batches.push(products.slice(index, index + PRODUCT_BATCH_SIZE));
  }

  return batches.length ? batches : [[]];
}