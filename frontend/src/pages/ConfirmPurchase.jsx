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
import { getShippingCost, runShippingSanityChecks } from '../utils/shipping'
import './ConfirmPurchase.css'

const formatPrice = (amount) => `${amount.toFixed(2).replace('.', ',')} €`

const COUNTRY_OPTIONS = ['Monaco', 'France', 'Andorre', 'Suisse']

/** Donation options TTC (euros): 0, 0.50, 1, 2. Labels neutres pour éviter toute pression. */
const DONATION_OPTIONS = [
	{ value: 0, label: '0 €' },
	{ value: 0.5, label: '0,50 €' },
	{ value: 1, label: '1 €' },
	{ value: 2, label: '2 €' },
]

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
		.enum(COUNTRY_OPTIONS, { required_error: 'Le pays est obligatoire' }),
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
		donationAmount: z.number().min(0).max(2),
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
	const [acceptedTerms, setAcceptedTerms] = useState(false)
	const {
		register,
		handleSubmit,
		control,
		watch,
		setValue,
		clearErrors,
		formState: { errors, isSubmitting },
	} = useForm({
		resolver: zodResolver(confirmPurchaseSchema),
		defaultValues: {
			billingSameAsShipping: true,
			country: 'France',
			billingCountry: 'France',
			donationAmount: 0,
		},
	})

	const billingSameAsShipping = watch('billingSameAsShipping')
	const country = watch('country')
	const donationAmount = watch('donationAmount') ?? 0

	const isMonaco = country === 'Monaco'

	useEffect(() => {
		if (country === 'Monaco') {
			setValue('city', 'Monaco')
			setValue('postalCode', '98000')
			clearErrors(['city', 'postalCode'])
		} else {
			setValue('city', '')
			setValue('postalCode', '')
		}
	}, [country, setValue, clearErrors])

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

	const shippingCost = useMemo(
		() => getShippingCost(totalItems, country ?? ''),
		[totalItems, country],
	)

	// TVA 20%: base = products + shipping + donation (all TTC)
	const donationTTC = useMemo(() => Number(donationAmount) || 0, [donationAmount])
	const totalTTC = useMemo(
		() => Math.round((totalPrice + shippingCost + donationTTC) * 100) / 100,
		[totalPrice, shippingCost, donationTTC],
	)
	const totalHT = useMemo(() => Math.round((totalTTC / 1.20) * 100) / 100, [totalTTC])
	const totalTVA = useMemo(() => Math.round((totalTTC - totalHT) * 100) / 100, [totalTTC, totalHT])
	const totalPriceHT = useMemo(() => Math.round((totalPrice / 1.20) * 100) / 100, [totalPrice])

	useEffect(() => {
		if (!hasItems) {
			navigate('/shop', { replace: true })
		}
	}, [hasItems, navigate])

	useEffect(() => {
		runShippingSanityChecks()
	}, [])

	// VAT sanity (dev): total TTC = total HT + total TVA; total TTC = products + shipping + donation
	if (import.meta.env?.DEV) {
		const ttcCheck = Math.abs(totalTTC - (totalHT + totalTVA)) < 0.02
		const sumCheck = Math.abs(totalTTC - (totalPrice + shippingCost + donationTTC)) < 0.02
		if (!ttcCheck || !sumCheck) {
			console.warn('[ConfirmPurchase] VAT/total sanity:', { totalTTC, totalHT, totalTVA, totalPrice, shippingCost, donationTTC })
		}
	}

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

			// Build cart items for order context
			const cartItems = entries.map(([gameId, quantity]) => {
				const game = gamesById.get(gameId)
				return {
					id: gameId,
					title: game?.title || 'Unknown',
					quantity,
					priceValue: game?.priceValue || 0,
				}
			})

			// Totals (shipping, donation and VAT already computed in component state)
			const orderShippingCost = shippingCost
			const orderDonation = donationTTC
			const orderTotalTTC = totalTTC
			const orderTotalHT = totalHT
			const orderTotalTVA = totalTVA

			// Build order context
			const orderContext = {
				orderId,
				customer: {
					email: data.email,
					firstName: data.firstName,
					lastName: data.lastName,
					phone: data.phone,
				},
				shippingAddress,
				billingAddress: data.billingSameAsShipping ? undefined : billingAddress,
				items: cartItems,
				totals: {
					subtotal: orderTotalHT,
					shipping: orderShippingCost,
					donation: orderDonation,
					tax: orderTotalTVA,
					total: orderTotalTTC,
				},
				donationAnalytics: {
					donationOptionsOffered: DONATION_OPTIONS.map((o) => o.value),
					donationSelectedAmount: orderDonation,
					donationSelectedLabel: DONATION_OPTIONS.find((o) => o.value === Number(data.donationAmount))?.label ?? `${orderDonation} €`,
					cartTotalTTCBeforeDonation: Math.round((totalPrice + shippingCost) * 100) / 100,
					totalItems,
				},
			}

			// Convert total TTC from euros to cents for Sherlock's
			const amountInCents = Math.round(orderTotalTTC * 100)

			// Process payment: initialize and redirect to Paypage
			await processPayment({
				amount: amountInCents,
				orderId,
				customerEmail: data.email,
				orderContext,
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
					<div className="confirm-purchase-totals-breakdown">
						<div className="confirm-purchase-totals-line">
							<span className="confirm-purchase-totals-label">Sous-total HT</span>
							<span className="confirm-purchase-totals-value">
								{formatPrice(totalPriceHT)}
							</span>
						</div>
						<div className="confirm-purchase-totals-line">
							<span className="confirm-purchase-totals-label">Livraison</span>
							<span className="confirm-purchase-totals-value">
								{shippingCost > 0 ? formatPrice(shippingCost) : '—'}
							</span>
						</div>
						{donationTTC > 0 && (
							<div className="confirm-purchase-totals-line">
								<span className="confirm-purchase-totals-label">Don</span>
								<span className="confirm-purchase-totals-value">
									{formatPrice(donationTTC)}
								</span>
							</div>
						)}
						<div className="confirm-purchase-totals-line">
							<span className="confirm-purchase-totals-label">TVA (20%)</span>
							<span className="confirm-purchase-totals-value">
								{formatPrice(totalTVA)}
							</span>
						</div>
						<div className="confirm-purchase-total">
							<p className="confirm-purchase-total-label">Total TTC</p>
							<p className="confirm-purchase-total-amount">
								{formatPrice(totalTTC)} · {totalItems}{' '}
								{totalItems <= 1 ? 'article' : 'articles'}
							</p>
						</div>
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
								readOnly={isMonaco}
								aria-invalid={errors.city ? 'true' : 'false'}
								aria-describedby={errors.city ? 'city-error' : undefined}
								className={isMonaco ? 'input-readonly' : ''}
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
								readOnly={isMonaco}
								aria-invalid={errors.postalCode ? 'true' : 'false'}
								aria-describedby={
									errors.postalCode ? 'postalCode-error' : undefined
								}
								className={isMonaco ? 'input-readonly' : ''}
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
						<select
							id="country"
							aria-invalid={errors.country ? 'true' : 'false'}
							aria-describedby={errors.country ? 'country-error' : undefined}
							{...register('country')}
						>
							<option value="">Sélectionnez un pays</option>
							{COUNTRY_OPTIONS.map((c) => (
								<option key={c} value={c}>
									{c}
								</option>
							))}
						</select>
						{errors.country && (
							<span id="country-error" className="form-error" role="alert">
								{errors.country.message}
							</span>
						)}
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
								<select
									id="billingCountry"
									aria-invalid={errors.billingCountry ? 'true' : 'false'}
									aria-describedby={errors.billingCountry ? 'billingCountry-error' : undefined}
									{...register('billingCountry')}
								>
									<option value="">Sélectionnez un pays</option>
									{COUNTRY_OPTIONS.map((c) => (
										<option key={c} value={c}>
											{c}
										</option>
									))}
								</select>
								{errors.billingCountry && (
									<span id="billingCountry-error" className="form-error" role="alert">
										{errors.billingCountry.message}
									</span>
								)}
							</div>
						</div>
					)}

					<div className="form-group confirm-purchase-donation" data-donation-block>
						<span className="confirm-purchase-donation-label">
							Un petit coup de pouce pour nous soutenir, c'est ici :
						</span>
						<Controller
							name="donationAmount"
							control={control}
							defaultValue={0}
							render={({ field }) => (
								<div className="confirm-purchase-donation-options" role="group" aria-label="Montant du don (TTC)">
									{DONATION_OPTIONS.map((opt, index) => (
										<label key={opt.value} className="confirm-purchase-donation-option">
											<input
												type="radio"
												value={opt.value}
												checked={field.value === opt.value}
												onChange={() => field.onChange(opt.value)}
												onBlur={field.onBlur}
												ref={index === 0 ? field.ref : undefined}
											/>
											<span>{opt.label}</span>
										</label>
									))}
								</div>
							)}
						/>
					</div>

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

					<div className="form-group-checkbox">
						<label htmlFor="acceptedTerms">
							<input
								id="acceptedTerms"
								type="checkbox"
								checked={acceptedTerms}
								onChange={(e) => setAcceptedTerms(e.target.checked)}
							/>
							<span>
								J'accepte les{' '}
								<a
									href="/conditions-generales-de-vente"
									target="_blank"
									rel="noopener noreferrer"
									onClick={(e) => e.stopPropagation()}
								>
									conditions générales de vente
								</a>
							</span>
						</label>
					</div>

					<button 
						type="submit" 
						className="btn btn-primary" 
						disabled={!acceptedTerms || isSubmitting}
					>
						{isSubmitting ? 'Redirection...' : 'Procéder au paiement'}
					</button>
				</form>
			</div>
		</section>
	)
}
