import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import './PaymentResult.css'

export default function PaymentResult() {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const { clearCart } = useCart()
	const [countdown, setCountdown] = useState(10)

	const status = searchParams.get('status')
	const responseCode = searchParams.get('responseCode')
	const transactionReference = searchParams.get('transactionReference')
	const reason = searchParams.get('reason')

	useEffect(() => {
		// Clear cart on successful payment
		if (status === 'success') {
			clearCart()
		}

		// Auto-redirect countdown
		const timer = setInterval(() => {
			setCountdown((prev) => {
				if (prev <= 1) {
					clearInterval(timer)
					navigate(status === 'success' ? '/shop' : '/confirm-purchase')
					return 0
				}
				return prev - 1
			})
		}, 1000)

		return () => clearInterval(timer)
	}, [status, navigate, clearCart])

	const handleRedirect = () => {
		if (status === 'success') {
			navigate('/shop')
		} else {
			navigate('/confirm-purchase')
		}
	}

	const renderContent = () => {
		switch (status) {
			case 'success':
				return (
					<>
						<div className="payment-result-icon payment-result-icon-success">✓</div>
						<h1 className="payment-result-title">Paiement réussi !</h1>
						<p className="payment-result-message">
							Votre paiement a été traité avec succès. Vous allez recevoir un email de
							confirmation dans quelques instants.
						</p>
						{transactionReference && (
							<p className="payment-result-reference">
								Référence de transaction : <strong>{transactionReference}</strong>
							</p>
						)}
						<p className="payment-result-redirect">
							Redirection automatique vers la boutique dans {countdown} seconde
							{countdown > 1 ? 's' : ''}...
						</p>
					</>
				)

			case 'cancelled':
				return (
					<>
						<div className="payment-result-icon payment-result-icon-cancelled">✕</div>
						<h1 className="payment-result-title">Paiement annulé</h1>
						<p className="payment-result-message">
							Vous avez annulé le paiement. Aucun montant n'a été débité.
						</p>
						{transactionReference && (
							<p className="payment-result-reference">
								Référence de transaction : <strong>{transactionReference}</strong>
							</p>
						)}
						<p className="payment-result-redirect">
							Redirection automatique vers la page de confirmation dans {countdown}{' '}
							seconde
							{countdown > 1 ? 's' : ''}...
						</p>
					</>
				)

			case 'error':
			default:
				return (
					<>
						<div className="payment-result-icon payment-result-icon-error">⚠</div>
						<h1 className="payment-result-title">Erreur de paiement</h1>
						<p className="payment-result-message">
							Une erreur s'est produite lors du traitement de votre paiement.
							{responseCode && ` (Code: ${responseCode})`}
							{reason && ` Raison: ${reason}`}
						</p>
						{transactionReference && (
							<p className="payment-result-reference">
								Référence de transaction : <strong>{transactionReference}</strong>
							</p>
						)}
						<p className="payment-result-message">
							Veuillez réessayer ou contacter notre service client si le problème
							persiste.
						</p>
						<p className="payment-result-redirect">
							Redirection automatique vers la page de confirmation dans {countdown}{' '}
							seconde
							{countdown > 1 ? 's' : ''}...
						</p>
					</>
				)
		}
	}

	return (
		<section className="page payment-result-page">
			<div className="payment-result-container card">
				{renderContent()}
				<button className="btn btn-primary" onClick={handleRedirect}>
					{status === 'success' ? 'Retour à la boutique' : 'Réessayer'}
				</button>
			</div>
		</section>
	)
}
