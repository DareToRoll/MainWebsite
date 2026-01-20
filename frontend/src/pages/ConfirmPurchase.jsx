import { useMemo, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import PhoneInput from 'react-phone-number-input'
import { isValidPhoneNumber } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { useCart } from '../context/CartContext'
import { processPayment } from '../lib/payments'
import catalog from '../content/catalog.json'
import './ConfirmPurchase.css'

const formatPrice = (amount) => `${amount.toFixed(2).replace('.', ',')} €`

const addressFields = {
	street: z
		.string()
		.min(1, 'L\'adresse est obligatoire')
		.min(5, 'L\'adresse doit contenir au moins 5 caractères'),
	city: z
		.string()
		.min(1, 'La ville est obligatoire')
		.min(2, 'La ville doit contenir au moins 2 caractères'),
	postalCode: z
		.string()
		.min(1, 'Le code postal est obligatoire')
		.min(5, 'Le code postal doit contenir au moins 5 caractères'),
	country: z
		.string()
		.min(1, 'Le pays est obligatoire')
		.min(2, 'Le pays doit contenir au moins 2 caractères'),
}

const confirmPurchaseSchema = z
	.object({
		firstName: z
			.string()
			.min(1, 'Le prénom est obligatoire')
			.min(2, 'Le prénom doit contenir au moins 2 caractères'),
		lastName: z
			.string()
			.min(1, 'Le nom est obligatoire')
			.min(2, 'Le nom doit contenir au moins 2 caractères'),
		email: z
			.string()
			.min(1, 'L\'adresse e-mail est obligatoire')
			.email({ message: 'Adresse e-mail invalide' }),
		phone: z
			.string()
			.min(1, 'Le numéro de téléphone est obligatoire')
			.refine(
				(val) => isValidPhoneNumber(val || ''),
				{ message: 'Numéro de téléphone invalide' },
			),
		billingSameAsShipping: z.boolean().default(true),
		deliveryInstructions: z.string().optional(),
		...addressFields,
		billingStreet: addressFields.street.optional(),
		billingCity: addressFields.city.optional(),
		billingPostalCode: addressFields.postalCode.optional(),
		billingCountry: addressFields.country.optional(),
	})
	.refine(
		(data) => {
			if (data.billingSameAsShipping) return true
			return (
				data.billingStreet &&
				data.billingCity &&
				data.billingPostalCode &&
				data.billingCountry
			)
		},
		{
			message: 'L\'adresse de facturation est obligatoire',
			path: ['billingStreet'],
		},
	)

export default function ConfirmPurchase() {
	const navigate = useNavigate()
	const { items } = useCart()
	const [paymentError, setPaymentError] = useState(null)
	const {
		register,
		handleSubmit,
		control,
		watch,
		formState: { errors, isSubmitting },
	} = useForm({
		resolver: zodResolver(confirmPurchaseSchema),
		defaultValues: {
			billingSameAsShipping: true,
		},
	})

	const billingSameAsShipping = watch('billingSameAsShipping')

	const entries = Object.entries(items)
	const gamesById = useMemo(
		() => new Map(catalog.games.map((g) => [g.id, g])),
		[],
	)

	const hasItems = entries.length > 0

	const totalPrice = useMemo(
		() =>
			entries.reduce((sum, [gameId, quantity]) => {
				const game = gamesById.get(gameId)
				if (!game || typeof game.priceValue !== 'number') return sum
				return sum + game.priceValue * quantity
			}, 0),
		[entries, gamesById],
	)

	const totalItems = useMemo(
		() => entries.reduce((sum, [, quantity]) => sum + quantity, 0),
		[entries],
	)

	useEffect(() => {
		if (!hasItems) {
			navigate('/shop', { replace: true })
		}
	}, [hasItems, navigate])

	const onSubmit = async (data) => {
		try {
			setPaymentError(null)

			// Generate a unique order ID
			const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

			// Build shipping address
			const shippingAddress = {
				street: data.street,
				city: data.city,
				postalCode: data.postalCode,
				country: data.country,
			}

			// Build billing address (derive from shipping if same, otherwise use billing fields)
			const billingAddress = data.billingSameAsShipping
				? shippingAddress
				: {
						street: data.billingStreet,
						city: data.billingCity,
						postalCode: data.billingPostalCode,
						country: data.billingCountry,
					}

			// Prepare return context with minimal payment data (max 255 chars)
			// Only include billing address and essential payment fields
			const returnContext = JSON.stringify({
				orderId,
				customerEmail: data.email,
				phoneE164: data.phone,
				billingAddress,
				items: entries.map(([gameId, quantity]) => ({ gameId, quantity })),
			})

			// Convert total price from euros to cents for Sherlock's
			const amountInCents = Math.round(totalPrice * 100)

			// Process payment: initialize and redirect to Paypage
			await processPayment({
				amount: amountInCents,
				orderId,
				customerEmail: data.email,
				returnContext,
			})

			// Note: User will be redirected to Sherlock's Paypage
			// After payment, they will be redirected back to /payment-result
		} catch (error) {
			console.error('[ConfirmPurchase] Payment error:', error)
			setPaymentError(error.message || 'Une erreur est survenue lors de l\'initialisation du paiement.')
		}
	}

	if (!hasItems) {
		return null
	}

	return (
		<section className="page confirm-purchase-page">
			<header className="page-header">
				<h1 className="page-title">Confirmer votre achat</h1>
				<p className="page-subtitle">
					Vérifiez votre commande et renseignez vos informations de facturation.
				</p>
			</header>

			<div className="confirm-purchase-layout">
				<div className="confirm-purchase-recap card">
					<h2 className="confirm-purchase-section-title">Récapitulatif</h2>
					<ul className="confirm-purchase-items">
						{entries.map(([gameId, quantity]) => {
							const game = gamesById.get(gameId)
							if (!game) return null

							const itemTotal = game.priceValue * quantity

							return (
								<li key={gameId} className="confirm-purchase-item">
									<div className="confirm-purchase-item-main">
										<p className="confirm-purchase-item-title">{game.title}</p>
										<p className="confirm-purchase-item-price">
											{game.price} TTC
										</p>
									</div>
									<div className="confirm-purchase-item-quantity">
										Quantité : {quantity}
									</div>
									<div className="confirm-purchase-item-total">
										{formatPrice(itemTotal)}
									</div>
								</li>
							)
						})}
					</ul>
					<div className="confirm-purchase-total">
						<p className="confirm-purchase-total-label">Total</p>
						<p className="confirm-purchase-total-amount">
							{formatPrice(totalPrice)} · {totalItems}{' '}
							{totalItems <= 1 ? 'article' : 'articles'}
						</p>
					</div>
				</div>

				<form
					className="confirm-purchase-form card"
					onSubmit={handleSubmit(onSubmit)}
					autoComplete="off"
					noValidate
				>
					<h2 className="confirm-purchase-section-title">
						Informations de livraison et facturation
					</h2>

					{paymentError && (
						<div className="form-error-banner" role="alert">
							<strong>Erreur :</strong> {paymentError}
						</div>
					)}

					<div className="form-row">
						<div className="form-group">
							<label htmlFor="firstName">Prénom</label>
							<input
								id="firstName"
								type="text"
								placeholder="Votre prénom"
								aria-invalid={errors.firstName ? 'true' : 'false'}
								aria-describedby={errors.firstName ? 'firstName-error' : undefined}
								{...register('firstName')}
							/>
							{errors.firstName && (
								<span id="firstName-error" className="form-error" role="alert">
									{errors.firstName.message}
								</span>
							)}
						</div>

						<div className="form-group">
							<label htmlFor="lastName">Nom</label>
							<input
								id="lastName"
								type="text"
								placeholder="Votre nom"
								aria-invalid={errors.lastName ? 'true' : 'false'}
								aria-describedby={errors.lastName ? 'lastName-error' : undefined}
								{...register('lastName')}
							/>
							{errors.lastName && (
								<span id="lastName-error" className="form-error" role="alert">
									{errors.lastName.message}
								</span>
							)}
						</div>
					</div>

					<div className="form-row">
						<div className="form-group">
							<label htmlFor="email">Adresse e-mail</label>
							<input
								id="email"
								type="email"
								placeholder="vous@exemple.com"
								aria-invalid={errors.email ? 'true' : 'false'}
								aria-describedby={errors.email ? 'email-error' : undefined}
								{...register('email')}
							/>
							{errors.email && (
								<span id="email-error" className="form-error" role="alert">
									{errors.email.message}
								</span>
							)}
						</div>

						<div className="form-group">
							<label htmlFor="phone">Téléphone</label>
							<Controller
								name="phone"
								control={control}
								rules={{ required: true }}
								render={({ field }) => (
									<PhoneInput
										{...field}
										id="phone"
										international
										defaultCountry="FR"
										placeholder="+33 6 12 34 56 78"
										className={`phone-input ${errors.phone ? 'phone-input-error' : ''}`}
										aria-invalid={errors.phone ? 'true' : 'false'}
										aria-describedby={errors.phone ? 'phone-error' : undefined}
									/>
								)}
							/>
							{errors.phone && (
								<span id="phone-error" className="form-error" role="alert">
									{errors.phone.message}
								</span>
							)}
						</div>
					</div>

					<div className="confirm-purchase-address-section">
						<h3 className="confirm-purchase-subsection-title">Adresse de livraison</h3>

						<div className="form-group">
							<label htmlFor="street">Adresse</label>
							<input
								id="street"
								type="text"
								placeholder="Numéro et nom de rue"
								aria-invalid={errors.street ? 'true' : 'false'}
								aria-describedby={errors.street ? 'street-error' : undefined}
								{...register('street')}
							/>
							{errors.street && (
								<span id="street-error" className="form-error" role="alert">
									{errors.street.message}
								</span>
							)}
						</div>
					</div>

					<div className="form-row">
						<div className="form-group">
							<label htmlFor="city">Ville</label>
							<input
								id="city"
								type="text"
								placeholder="Ville"
								aria-invalid={errors.city ? 'true' : 'false'}
								aria-describedby={errors.city ? 'city-error' : undefined}
								{...register('city')}
							/>
							{errors.city && (
								<span id="city-error" className="form-error" role="alert">
									{errors.city.message}
								</span>
							)}
						</div>

						<div className="form-group">
							<label htmlFor="postalCode">Code postal</label>
							<input
								id="postalCode"
								type="text"
								placeholder="75001"
								aria-invalid={errors.postalCode ? 'true' : 'false'}
								aria-describedby={
									errors.postalCode ? 'postalCode-error' : undefined
								}
								{...register('postalCode')}
							/>
							{errors.postalCode && (
								<span
									id="postalCode-error"
									className="form-error"
									role="alert"
								>
									{errors.postalCode.message}
								</span>
							)}
						</div>
					</div>

					<div className="form-group">
						<label htmlFor="country">Pays</label>
						<input
							id="country"
							type="text"
							placeholder="France"
							aria-invalid={errors.country ? 'true' : 'false'}
							aria-describedby={errors.country ? 'country-error' : undefined}
							{...register('country')}
						/>
						{errors.country && (
							<span id="country-error" className="form-error" role="alert">
								{errors.country.message}
							</span>
						)}
					</div>

					<div className="form-group">
						<label htmlFor="deliveryInstructions">Instructions de livraison (optionnel)</label>
						<textarea
							id="deliveryInstructions"
							placeholder="Informations utiles pour la livraison..."
							rows={3}
							{...register('deliveryInstructions')}
						/>
					</div>

					<div className="form-group-checkbox">
						<label htmlFor="billingSameAsShipping">
							<input
								id="billingSameAsShipping"
								type="checkbox"
								{...register('billingSameAsShipping')}
							/>
							<span>Adresse de facturation identique à l'adresse de livraison</span>
						</label>
					</div>

					{!billingSameAsShipping && (
						<div className="confirm-purchase-address-section">
							<h3 className="confirm-purchase-subsection-title">Adresse de facturation</h3>

							<div className="form-group">
								<label htmlFor="billingStreet">Adresse</label>
								<input
									id="billingStreet"
									type="text"
									placeholder="Numéro et nom de rue"
									aria-invalid={errors.billingStreet ? 'true' : 'false'}
									aria-describedby={errors.billingStreet ? 'billingStreet-error' : undefined}
									{...register('billingStreet')}
								/>
								{errors.billingStreet && (
									<span id="billingStreet-error" className="form-error" role="alert">
										{errors.billingStreet.message}
									</span>
								)}
							</div>

							<div className="form-row">
								<div className="form-group">
									<label htmlFor="billingCity">Ville</label>
									<input
										id="billingCity"
										type="text"
										placeholder="Ville"
										aria-invalid={errors.billingCity ? 'true' : 'false'}
										aria-describedby={errors.billingCity ? 'billingCity-error' : undefined}
										{...register('billingCity')}
									/>
									{errors.billingCity && (
										<span id="billingCity-error" className="form-error" role="alert">
											{errors.billingCity.message}
										</span>
									)}
								</div>

								<div className="form-group">
									<label htmlFor="billingPostalCode">Code postal</label>
									<input
										id="billingPostalCode"
										type="text"
										placeholder="75001"
										aria-invalid={errors.billingPostalCode ? 'true' : 'false'}
										aria-describedby={
											errors.billingPostalCode ? 'billingPostalCode-error' : undefined
										}
										{...register('billingPostalCode')}
									/>
									{errors.billingPostalCode && (
										<span
											id="billingPostalCode-error"
											className="form-error"
											role="alert"
										>
											{errors.billingPostalCode.message}
										</span>
									)}
								</div>
							</div>

							<div className="form-group">
								<label htmlFor="billingCountry">Pays</label>
								<input
									id="billingCountry"
									type="text"
									placeholder="France"
									aria-invalid={errors.billingCountry ? 'true' : 'false'}
									aria-describedby={errors.billingCountry ? 'billingCountry-error' : undefined}
									{...register('billingCountry')}
								/>
								{errors.billingCountry && (
									<span id="billingCountry-error" className="form-error" role="alert">
										{errors.billingCountry.message}
									</span>
								)}
							</div>
						</div>
					)}

					<div className="confirm-purchase-summary">
						<div className="confirm-purchase-summary-item">
							<span className="confirm-purchase-summary-label">Livraison :</span>
							<span className="confirm-purchase-summary-value">
								{watch('street') || 'Non renseigné'}, {watch('city') || 'Non renseigné'},{' '}
								{watch('postalCode') || 'Non renseigné'}, {watch('country') || 'Non renseigné'}
							</span>
						</div>
						<div className="confirm-purchase-summary-item">
							<span className="confirm-purchase-summary-label">Facturation :</span>
							<span className="confirm-purchase-summary-value">
								{billingSameAsShipping
									? 'Identique à l\'adresse de livraison'
									: watch('billingStreet')
										? `${watch('billingStreet')}, ${watch('billingCity')}, ${watch('billingPostalCode')}, ${watch('billingCountry')}`
										: 'Non renseigné'}
							</span>
						</div>
					</div>

					<p className="contact-form-note">
						En procédant au paiement, vous acceptez nos conditions générales de vente.
					</p>

					<button type="submit" className="btn btn-primary" disabled={isSubmitting}>
						{isSubmitting ? 'Redirection...' : 'Procéder au paiement'}
					</button>
				</form>
			</div>
		</section>
	)
}
