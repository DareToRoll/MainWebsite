import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { retryPayment } from '../lib/payments'
import './PaymentResult.css'

function getApiBaseUrl() {
	return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
}

export default function PaymentResult() {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const { clearCart } = useCart()
	const [countdown, setCountdown] = useState(10)
	const [result, setResult] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const timerRef = useRef(null)
	const hasNavigatedRef = useRef(false)
	const hasFetchedRef = useRef(false)

	useEffect(() => {
		// Prevent double fetch
		if (hasFetchedRef.current) return
		
		const token = searchParams.get('token')
		
		if (!token) {
			setError('Résultat de paiement introuvable.')
			setLoading(false)
			return
		}

		// Mark as fetched immediately to prevent duplicate calls
		hasFetchedRef.current = true

		// Fetch payment result from API
		const fetchResult = async () => {
			try {
				const apiBaseUrl = getApiBaseUrl()
				const response = await fetch(`${apiBaseUrl}/api/payment/result?token=${encodeURIComponent(token)}`)

				if (!response.ok) {
					if (response.status === 404) {
						setError('Résultat de paiement introuvable ou expiré.')
					} else {
						setError('Erreur lors de la récupération du résultat.')
					}
					setLoading(false)
					return
				}

				const data = await response.json()
				if (data.success) {
					setResult({
						status: data.status,
						title: data.title,
						message: data.message,
						canRetry: data.canRetry,
						nextAction: data.nextAction,
						responseCode: data.responseCode,
						acquirerResponseCode: data.acquirerResponseCode,
						transactionReference: data.transactionReference,
						customerId: data.customerId,
						orderId: data.orderId,
					})

					// Clear cart on successful payment
					if (data.status === 'success') {
						clearCart()
					}
				} else {
					setError('Résultat de paiement invalide.')
				}
			} catch (err) {
				setError('Erreur lors de la récupération du résultat.')
			} finally {
				setLoading(false)
			}
		}

		fetchResult()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []) // Only run once on mount

	// Countdown timer (only for success status)
	useEffect(() => {
		if (!result || hasNavigatedRef.current) return
		
		// Only auto-redirect on success
		if (result.status !== 'success') return

		timerRef.current = setInterval(() => {
			setCountdown((prev) => {
				if (prev <= 1) {
					if (timerRef.current) {
						clearInterval(timerRef.current)
						timerRef.current = null
					}
					if (!hasNavigatedRef.current) {
						hasNavigatedRef.current = true
						navigate('/shop', { replace: true })
					}
					return 0
				}
				return prev - 1
			})
		}, 1000)

		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current)
				timerRef.current = null
			}
		}
	}, [result, navigate])

	const handleRedirect = async (e) => {
		e.preventDefault()
		if (hasNavigatedRef.current) return

		if (timerRef.current) {
			clearInterval(timerRef.current)
			timerRef.current = null
		}

		if (result?.status === 'success') {
			hasNavigatedRef.current = true
			navigate('/shop', { replace: true })
		} else if (result?.canRetry && result?.orderId) {
			// Retry payment using stored order context
			try {
				setLoading(true)
				await retryPayment(result.orderId)
				// User will be redirected to payment page
			} catch (error) {
				console.error('[PaymentResult] Retry error:', error)
				setError(error.message || 'Erreur lors de la réinitialisation du paiement.')
				setLoading(false)
			}
		} else {
			// Fallback: navigate to confirm-purchase if no orderId or can't retry
			hasNavigatedRef.current = true
			navigate('/confirm-purchase', { replace: true })
		}
	}

	const getButtonText = () => {
		if (result?.status === 'success') {
			return 'Retour à la boutique'
		}
		if (result?.canRetry) {
			switch (result.nextAction) {
				case 'retry':
					return 'Réessayer'
				case 'use_another_card':
					return 'Utiliser une autre carte'
				case 'contact_bank':
					return 'Retour'
				case 'contact_support':
					return 'Retour'
				default:
					return 'Réessayer'
			}
		}
		return 'Retour'
	}

	if (loading) {
		return (
			<section className="page payment-result-page">
				<div className="payment-result-container card">
					<p className="payment-result-message">Chargement du résultat...</p>
				</div>
			</section>
		)
	}

	if (error || !result) {
		return (
			<section className="page payment-result-page">
				<div className="payment-result-container card">
					<div className="payment-result-icon payment-result-icon-error">⚠</div>
					<h1 className="payment-result-title">Erreur</h1>
					<p className="payment-result-message">{error || 'Résultat de paiement introuvable.'}</p>
					<button className="btn btn-primary" onClick={() => navigate('/shop')}>
						Retour à la boutique
					</button>
				</div>
			</section>
		)
	}

	const getStatusIcon = () => {
		switch (result.status) {
			case 'success':
				return <div className="payment-result-icon payment-result-icon-success">✓</div>
			case 'cancelled':
				return <div className="payment-result-icon payment-result-icon-cancelled">✕</div>
			case 'pending':
				return <div className="payment-result-icon payment-result-icon-pending">⏳</div>
			case 'declined':
			case 'technical_error':
			case 'configuration_error':
			case 'unknown':
			default:
				return <div className="payment-result-icon payment-result-icon-error">⚠</div>
		}
	}

	const renderContent = () => {
		return (
			<>
				{getStatusIcon()}
				<h1 className="payment-result-title">{result.title}</h1>
				<p className="payment-result-message">{result.message}</p>
				{result.transactionReference && (
					<p className="payment-result-reference">
						Référence de transaction : <strong>{result.transactionReference}</strong>
					</p>
				)}
				{result.status === 'success' && (
					<p className="payment-result-redirect">
						Redirection automatique vers la boutique dans {countdown} seconde
						{countdown > 1 ? 's' : ''}...
					</p>
				)}
				{import.meta.env?.DEV && result.responseCode && (
					<p className="payment-result-debug">
						Code: {result.responseCode}
						{result.acquirerResponseCode && ` / ${result.acquirerResponseCode}`}
					</p>
				)}
			</>
		)
	}

	return (
		<section className="page payment-result-page">
			<div className="payment-result-container card">
				{renderContent()}
				<button className="btn btn-primary" onClick={handleRedirect}>
					{getButtonText()}
				</button>
			</div>
		</section>
	)
}
