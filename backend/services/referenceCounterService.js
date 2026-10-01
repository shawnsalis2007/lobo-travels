import { db, isFirestoreAvailable } from "../config/firebase.js";

const COUNTERS_COLLECTION = "counters";
const ITINERARIES_COUNTER_DOC = "itineraries";

// In-memory counter fallback if Firestore is unavailable
let memoryCounter = {
  year: new Date().getFullYear(),
  lastNumber: 0,
};

/**
 * Generates the next sequential reference numbers for itineraries and travel vouchers.
 * Core ID format: {YYYY}-{0001} (e.g., 2026-0001)
 * itineraryRef = "LT-2026-0001"
 * voucherRef = "LTV-2026-0001"
 *
 * Uses Firestore transaction for atomic guarantees across concurrent requests.
 *
 * @returns {Promise<{ coreId: string, itineraryRef: string, voucherRef: string, source: string }>}
 */
export async function getNextSequentialReference() {
  const currentYear = new Date().getFullYear();

  if (isFirestoreAvailable && db) {
    try {
      const counterRef = db.collection(COUNTERS_COLLECTION).doc(ITINERARIES_COUNTER_DOC);

      const transactionPromise = db.runTransaction(async (transaction) => {
        const counterDoc = await transaction.get(counterRef);

        let nextNumber = 1;

        if (counterDoc.exists) {
          const data = counterDoc.data() || {};
          // If counter is from a previous year, reset to 1 for the new year
          if (data.year === currentYear) {
            nextNumber = (typeof data.lastNumber === "number" ? data.lastNumber : 0) + 1;
          }
        }

        transaction.set(
          counterRef,
          {
            year: currentYear,
            lastNumber: nextNumber,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        return nextNumber;
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Firestore transaction timeout")), 2500)
      );

      const result = await Promise.race([transactionPromise, timeoutPromise]);

      const coreId = `${currentYear}-${String(result).padStart(4, "0")}`;
      const itineraryRef = `LT-${coreId}`;
      const voucherRef = `LTV-${coreId}`;

      console.log(`🔢 [Firestore Counter] Generated sequential ID: ${itineraryRef} / ${voucherRef}`);
      return { coreId, itineraryRef, voucherRef, source: "Firestore Transaction" };
    } catch (err) {
      console.warn("⚠️ [Firestore Counter] Transaction error/timeout, falling back to in-memory counter:", err.message);
    }
  }

  // Memory fallback
  if (memoryCounter.year !== currentYear) {
    memoryCounter.year = currentYear;
    memoryCounter.lastNumber = 0;
  }
  memoryCounter.lastNumber += 1;

  const coreId = `${currentYear}-${String(memoryCounter.lastNumber).padStart(4, "0")}`;
  const itineraryRef = `LT-${coreId}`;
  const voucherRef = `LTV-${coreId}`;

  console.log(`🔢 [Memory Counter] Generated sequential ID: ${itineraryRef} / ${voucherRef}`);
  return { coreId, itineraryRef, voucherRef, source: "Local Counter" };
}
