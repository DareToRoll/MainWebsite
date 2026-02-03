import postalPrices from './postalPrices.json'

const COUNTRY_TO_CODE = {
	France: 'FR',
	Monaco: 'MC',
	Andorre: 'AD',
	Suisse: 'CH',
}

const MAX_QTY = postalPrices.maxQtyPerParcel ?? 25
const BY_ZONE = postalPrices.perParcel?.postageTtcByZoneByQty ?? {}
const COUNTRY_TO_ZONE = postalPrices.countryToZone ?? {}

function roundEuro(x) {
	return Math.round(x * 100) / 100
}

/**
 * Split quantity into chunks of at most MAX_QTY, largest first.
 * e.g. 28 -> [25, 3]; 50 -> [25, 25]; 3 -> [3]
 */
function chunkQuantity(qty) {
	if (qty <= 0) return []
	const chunks = []
	let n = qty
	while (n > 0) {
		const chunk = Math.min(MAX_QTY, n)
		chunks.push(chunk)
		n -= chunk
	}
	return chunks
}

/**
 * Get shipping cost TTC for a given quantity and country (display name).
 * Monaco => 0. Unknown/invalid country => 0.
 * Uses postalPrices.json: postageTtcByZoneByQty[zone][qty] for each chunk.
 */
export function getShippingCost(quantity, country) {
	if (quantity <= 0) return 0
	const name = country?.trim?.()
	if (!name) return 0
	if (name === 'Monaco') return 0
	const code = COUNTRY_TO_CODE[name]
	if (!code) return 0
	const zone = COUNTRY_TO_ZONE[code]
	if (!zone) return 0
	const prices = BY_ZONE[zone]
	if (!prices || !Array.isArray(prices)) return 0

	const chunks = chunkQuantity(quantity)
	let total = 0
	for (const q of chunks) {
		const price = prices[q]
		if (typeof price !== 'number') return 0
		total += price
	}
	return roundEuro(total)
}

/**
 * Sanity checks (run in dev). No test runner; inline guarded checks.
 */
export function runShippingSanityChecks() {
	if (import.meta.env?.PROD) return
	const checks = []
	// Monaco any quantity → 0
	const m0 = getShippingCost(1, 'Monaco')
	const m28 = getShippingCost(28, 'Monaco')
	if (m0 !== 0 || m28 !== 0) checks.push(`Monaco shipping expected 0, got ${m0}, ${m28}`)
	// France 1, 3, 25, 28 → shipping(28) = shipping(25) + shipping(3)
	const f1 = getShippingCost(1, 'France')
	const f3 = getShippingCost(3, 'France')
	const f25 = getShippingCost(25, 'France')
	const f28 = getShippingCost(28, 'France')
	const expected28 = roundEuro(f25 + f3)
	if (Math.abs(f28 - expected28) > 0.01) checks.push(`France 28: expected ${expected28}, got ${f28} (25=${f25}, 3=${f3})`)
	// Andorre / Suisse basic
	const a2 = getShippingCost(2, 'Andorre')
	const s5 = getShippingCost(5, 'Suisse')
	if (typeof a2 !== 'number' || a2 < 0 || typeof s5 !== 'number' || s5 < 0) checks.push(`Andorre/Suisse basic: a2=${a2}, s5=${s5}`)
	// Unknown country → 0
	const unknown = getShippingCost(5, 'Invalid')
	if (unknown !== 0) checks.push(`Unknown country expected 0, got ${unknown}`)
	if (checks.length) console.warn('[shipping] sanity checks failed:', checks)
}
