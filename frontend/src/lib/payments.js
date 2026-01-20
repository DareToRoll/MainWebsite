/**
 * Sherlock's Payment Integration
 * Handles payment initialization and form submission to Paypage
 */

/**
 * Get API base URL from environment
 */
function getApiBaseUrl() {
	return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
}

/**
 * Initialize a payment with Sherlock's
 * @param {Object} paymentData - Payment initialization data
 * @param {number} paymentData.amount - Amount in euros (will be converted to cents)
 * @param {string} paymentData.orderId - Unique order identifier
 * @param {string} paymentData.customerEmail - Customer email
 * @param {string} [paymentData.returnContext] - Optional context to pass through the payment flow
 * @returns {Promise<{redirectionUrl: string, redirectionData: string, redirectionVersion: string}>}
 */
export async function initializePayment(paymentData) {
	const apiBaseUrl = getApiBaseUrl()
	const response = await fetch(`${apiBaseUrl}/api/payment/init`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(paymentData),
	})

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}))
		throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
	}

	const data = await response.json()

	if (!data.success || !data.redirectionUrl || !data.redirectionData || !data.redirectionVersion) {
		throw new Error('Invalid response from payment initialization')
	}

	return {
		redirectionUrl: data.redirectionUrl,
		redirectionData: data.redirectionData,
		redirectionVersion: data.redirectionVersion,
	}
}

/**
 * Create and auto-submit a form to redirect to Sherlock's Paypage
 * @param {string} redirectionUrl - Paypage URL
 * @param {string} redirectionData - Encrypted payment data
 * @param {string} redirectionVersion - Interface version
 */
export function submitPaymentForm(redirectionUrl, redirectionData, redirectionVersion) {
	// Create a hidden form
	const form = document.createElement('form')
	form.method = 'POST'
	form.action = redirectionUrl
	form.style.display = 'none'

	// Add redirectionVersion field
	const versionInput = document.createElement('input')
	versionInput.type = 'hidden'
	versionInput.name = 'redirectionVersion'
	versionInput.value = redirectionVersion
	form.appendChild(versionInput)

	// Add redirectionData field
	const dataInput = document.createElement('input')
	dataInput.type = 'hidden'
	dataInput.name = 'redirectionData'
	dataInput.value = redirectionData
	form.appendChild(dataInput)

	// Append form to body and submit
	document.body.appendChild(form)
	form.submit()
}

/**
 * Complete payment flow: initialize and redirect to Paypage
 * @param {Object} paymentData - Payment data (see initializePayment)
 * @returns {Promise<void>}
 */
export async function processPayment(paymentData) {
	try {
		const { redirectionUrl, redirectionData, redirectionVersion } = await initializePayment(paymentData)
		submitPaymentForm(redirectionUrl, redirectionData, redirectionVersion)
	} catch (error) {
		console.error('[Payment] Error processing payment:', error)
		throw error
	}
}
