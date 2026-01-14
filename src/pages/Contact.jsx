import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import './Contact.css'

// Validation schema
const contactSchema = z.object({
	name: z
		.string()
		.min(1, 'Le nom est obligatoire')
		.min(2, 'Le nom doit contenir au moins 2 caractères'),
	email: z
		.string()
		.min(1, 'L\'adresse e-mail est obligatoire')
		.email({ message: 'Adresse e-mail invalide' }),
	topic: z
		.string()
		.min(1, 'Le sujet est obligatoire'),
	message: z
		.string()
		.min(1, 'Le message est obligatoire')
		.min(10, 'Le message doit contenir au moins 10 caractères'),
	website: z.string().optional(), // Honeypot field
})

export default function Contact() {
	const [status, setStatus] = useState(null)
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
	} = useForm({
		resolver: zodResolver(contactSchema),
		defaultValues: {
			topic: 'general',
			website: '', // Honeypot
		},
	})

	const onSubmit = async (data) => {
		setStatus(null)

		// Check honeypot field (should be empty)
		if (data.website) {
			// Bot detected, silently fail
			return
		}

		const payload = {
			name: data.name.trim(),
			email: data.email.trim(),
			topic: data.topic || 'general',
			message: data.message.trim(),
		}

		try {
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			})

			const json = await response.json()

			if (!response.ok) {
				throw new Error(json.error || 'Erreur serveur')
			}

			setStatus({
				type: 'success',
				message: 'Votre message nous est bien parvenu. On vous répond au plus vite !',
			})
			reset()
		} catch (error) {
			console.error(error)
			setStatus({
				type: 'error',
				message: "Une erreur s'est produite lors de l'envoi. Veuillez réessayer ou réessayer plus tard.",
			})
		}
	}

	return (
		<section className="page contact-page">
			<header className="page-header">
				<h1 className="page-title">Contactez Dare to Roll</h1>
				<p className="page-subtitle">
					Une question sur nos jeux, une idée folle, une collaboration qui démange ou juste
					envie de papoter&nbsp;? On adore recevoir vos messages et on lit chacun d&apos;eux avec attention.
				</p>
			</header>

			<div className="contact-layout">
				<div className="contact-intro">
					<p>
						Que vous soyez joueur passionné, organisateur d&apos;événements, boutique ou
						simplement curieux, vos retours nous font grandir. Chaque commentaire, chaque idée
						et chaque proposition nous aide à peaufiner nos jeux et à imaginer les suivants.
					</p>
					<p>
						N&apos;hésitez pas à nous écrire via ce formulaire. On fait notre possible pour répondre
						rapidement, en privilégiant les demandes liées à nos jeux en cours et aux événements,
						mais chaque message compte pour nous.
					</p>
				</div>

				<form
					className="contact-form card"
					onSubmit={handleSubmit(onSubmit)}
					autoComplete="off"
					noValidate
				>
					<div
						className="contact-honeypot"
						aria-hidden="true"
					>
						<label htmlFor="website">Ne pas remplir ce champ</label>
						<input
							id="website"
							type="text"
							tabIndex="-1"
							autoComplete="off"
							{...register('website')}
						/>
					</div>

					<div className="form-row">
						<div className="form-group">
							<label htmlFor="name">Nom complet</label>
							<input
								id="name"
								type="text"
								placeholder="Votre nom et prénom"
								aria-invalid={errors.name ? 'true' : 'false'}
								aria-describedby={errors.name ? 'name-error' : undefined}
								{...register('name')}
							/>
							{errors.name && (
								<span id="name-error" className="form-error" role="alert">
									{errors.name.message}
								</span>
							)}
						</div>

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
					</div>

					<div className="form-group">
						<label htmlFor="topic">Sujet de votre demande</label>
						<select
							id="topic"
							aria-invalid={errors.topic ? 'true' : 'false'}
							aria-describedby={errors.topic ? 'topic-error' : undefined}
							{...register('topic')}
						>
							<option value="general">Question générale</option>
							<option value="game">À propos d&apos;un jeu</option>
							<option value="event">Événement / soirée jeux</option>
							<option value="shop">Boutique / distribution</option>
							<option value="other">Autre</option>
						</select>
						{errors.topic && (
							<span id="topic-error" className="form-error" role="alert">
								{errors.topic.message}
							</span>
						)}
					</div>

					<div className="form-group">
						<label htmlFor="message">Votre message</label>
						<textarea
							id="message"
							rows={5}
							placeholder="Expliquez-nous en quelques lignes le contexte de votre demande."
							aria-invalid={errors.message ? 'true' : 'false'}
							aria-describedby={errors.message ? 'message-error' : undefined}
							{...register('message')}
						/>
						{errors.message && (
							<span id="message-error" className="form-error" role="alert">
								{errors.message.message}
							</span>
						)}
					</div>

					<button type="submit" className="btn btn-primary" disabled={isSubmitting}>
						{isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
					</button>

					{status && (
						<p className={
								status.type === 'success'
									? 'contact-status contact-status-success'
									: 'contact-status contact-status-error'
							}
						>
							{status.message}
						</p>
					)}

					<p className="contact-form-note">
						Ce formulaire ne crée pas de compte et ne vous inscrit à aucune
						newsletter. Vos informations ne sont utilisées que pour traiter votre
						demande.
					</p>
				</form>
			</div>
		</section>
	)
}
