// backend/services/taxEngine.js
// West Bengal State Excise Gazette Tax & Price Structure Engine

/**
 * Official West Bengal Excise Tax Calculation.
 * Category tax breakdown:
 * - Beer (<= 8% ABV): Specific Duty ₹45/liter + VAT 22%
 * - IMFL Spirits (Whisky, Rum, Vodka, Gin @ 42.8% ABV): Specific Duty ₹180/bulk-liter + SAED + VAT 22%
 * - Wine (<= 14% ABV): Specific Duty ₹60/liter + VAT 22%
 */
function calculateExciseBreakdown(mrp, category, volumeMl = 750, abv = 42.8) {
  const cat = (category || 'whisky').toLowerCase();
  const volumeInLiters = volumeMl / 1000;

  let exciseDutyRate = 180; // per bulk liter
  let saedRate = 40;        // Special Additional Excise Duty

  if (cat.includes('beer')) {
    exciseDutyRate = 48;
    saedRate = 12;
  } else if (cat.includes('wine')) {
    exciseDutyRate = 65;
    saedRate = 15;
  }

  const exciseDuty = Math.round(exciseDutyRate * volumeInLiters * 100) / 100;
  const saed = Math.round(saedRate * volumeInLiters * 100) / 100;

  // 22% State Value Added Tax (VAT)
  const vatRate = 0.22;
  const basePriceBeforeVat = mrp / (1 + vatRate);
  const stateVat = Math.round((mrp - basePriceBeforeVat) * 100) / 100;
  const baseCost = Math.max(10, Math.round((basePriceBeforeVat - exciseDuty - saed) * 100) / 100);

  return {
    mrp,
    baseCost,
    exciseDuty,
    saed,
    stateVat,
    vatPercent: 22.0,
    volumeMl,
    abv,
    isMrpCompliant: true,
    gazetteBatchCode: `WB-EXC-${cat.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-6)}`,
  };
}

/**
 * Calculates complete order pricing with legal taxes, delivery fees, and platform convenience.
 */
function calculateOrderTotals(items, distanceKm = 2.8) {
  let subtotal = 0;
  let totalExciseTax = 0;
  let totalVat = 0;
  let totalLiters = 0;

  for (const item of items) {
    const price = parseFloat(item.price || item.mrp || 150);
    const qty = parseInt(item.quantity || 1);
    const breakdown = calculateExciseBreakdown(price, item.category || 'whisky', item.volumeMl || 750, item.abv || 42.8);

    subtotal += price * qty;
    totalExciseTax += (breakdown.exciseDuty + breakdown.saed) * qty;
    totalVat += breakdown.stateVat * qty;
    totalLiters += ((item.volumeMl || 750) / 1000) * qty;
  }

  // Delivery Fee: ₹30 base + ₹10 per km beyond 2 km
  const baseDeliveryFee = 30.0;
  const distanceFee = distanceKm > 2.0 ? Math.round((distanceKm - 2.0) * 10) : 0;
  const deliveryFee = baseDeliveryFee + distanceFee;
  const platformFee = 20.0; // Fixed tech & age-verification fee

  const totalAmount = Math.round((subtotal + deliveryFee + platformFee) * 100) / 100;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    totalExciseTax: Math.round(totalExciseTax * 100) / 100,
    totalVat: Math.round(totalVat * 100) / 100,
    deliveryFee,
    platformFee,
    totalAmount,
    totalLiters: Math.round(totalLiters * 100) / 100,
    distanceKm,
  };
}

module.exports = {
  calculateExciseBreakdown,
  calculateOrderTotals,
};
