import { getShippingCost } from './shipping'

/**
 * Round to 2 decimal places (euros)
 */
function roundEuro(x) {
	return Math.round(x * 100) / 100
}

/**
 * Calculate order totals from cart items and form data
 * All prices are TTC (VAT included)
 * 
 * @param {Array<{priceValue: number, quantity: number}>} cartItems
 * @param {string} country
 * @param {number} donationAmount
 * @returns {Object} totals breakdown
 */
export function calculateOrderTotals(cartItems, country, donationAmount = 0) {
	// Products total TTC
	const productsTTC = cartItems.reduce(
		(sum, item) => sum + (item.priceValue || 0) * item.quantity,
		0
	)

	// Total items count
	const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

	// Shipping cost TTC
	const shippingTTC = getShippingCost(totalItems, country)

	// Donation TTC (non-taxable)
	const donationTTC = Number(donationAmount) || 0

	// Calculate HT and VAT (20%) - only on taxable items (products + shipping)
	const taxableBaseTTC = productsTTC + shippingTTC
	const totalHT = roundEuro(taxableBaseTTC / 1.20)
	const totalTVA = roundEuro(taxableBaseTTC - totalHT)
	const productsHT = roundEuro(productsTTC / 1.20)
	const shippingHT = roundEuro(shippingTTC / 1.20)

	// Total TTC (products + shipping + donation)
	const totalTTC = roundEuro(productsTTC + shippingTTC + donationTTC)

	return {
		productsTTC,
		productsHT,
		shippingTTC,
		shippingHT,
		donationTTC,
		totalHT,
		totalTVA,
		totalTTC,
		totalItems,
		// Amount in cents for payment API
		amountInCents: Math.round(totalTTC * 100),
	}
}

/**
 * Format price for display (French locale)
 */
export function formatPrice(amount) {
	return `${amount.toFixed(2).replace('.', ',')} €`
}
