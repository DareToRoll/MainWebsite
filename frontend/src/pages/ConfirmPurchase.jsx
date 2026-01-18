import { useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCart } from '../context/CartContext'
import catalog from '../content/catalog.json'
import './ConfirmPurchase.css'

const formatPrice = (amount) => `${amount.toFixed(2).replace('.', ',')} €`

const confirmPurchaseSchema = z.object({
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
		.min(10, 'Le numéro de téléphone doit contenir au moins 10 caractères'),
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
})

export default function ConfirmPurchase() {
	const navigate = useNavigate()
	const { items, closeCart } = useCart()
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm({
		resolver: zodResolver(confirmPurchaseSchema),
	})

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
		// TODO: Navigate to payment step (e.g., /payment route or Sherlock form)
		console.log('Proceed to payment with data:', data)
		navigate('/payment', { state: { customerData: data } })
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
						Informations de facturation
					</h2>

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
							<input
								id="phone"
								type="tel"
								placeholder="+33 6 12 34 56 78"
								aria-invalid={errors.phone ? 'true' : 'false'}
								aria-describedby={errors.phone ? 'phone-error' : undefined}
								{...register('phone')}
							/>
							{errors.phone && (
								<span id="phone-error" className="form-error" role="alert">
									{errors.phone.message}
								</span>
							)}
						</div>
					</div>

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

					<button type="submit" className="btn btn-primary" disabled={isSubmitting}>
						{isSubmitting ? 'Redirection...' : 'Procéder au paiement'}
					</button>
				</form>
			</div>
		</section>
	)
}
