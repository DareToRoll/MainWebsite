import { useState } from 'react'
import './Contact.css'

export default function Contact() {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [status, setStatus] = useState(null)

	const handleSubmit = async (event) => {
		event.preventDefault()
		setStatus(null)

		const formData = new FormData(event.target)
		const payload = {
			name: formData.get('name'),
			email: formData.get('email'),
			topic: formData.get('topic'),
			message: formData.get('message'),
		}

		try {
			setIsSubmitting(true)

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
			event.target.reset()
		} catch (error) {
			console.error(error)
			setStatus({
				type: 'error',
				message: "Une erreur s'est produite lors de l'envoi. Veuillez réessayer ou réessayer plus tard.",
			})
		} finally {
			setIsSubmitting(false)
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
					onSubmit={handleSubmit}
					autoComplete="off"
				>
					<div
						className="contact-honeypot"
						aria-hidden="true"
					>
						<label htmlFor="website">Ne pas remplir ce champ</label>
						<input
							id="website"
							name="website"
							type="text"
							tabIndex="-1"
							autoComplete="off"
						/>
					</div>

					<div className="form-row">
						<div className="form-group">
							<label htmlFor="name">Nom complet</label>
							<input
								id="name"
								name="name"
								type="text"
								required
								placeholder="Votre nom et prénom"
							/>
						</div>

						<div className="form-group">
							<label htmlFor="email">Adresse e-mail</label>
							<input
								id="email"
								name="email"
								type="email"
								required
								placeholder="vous@exemple.com"
							/>
						</div>
					</div>

					<div className="form-group">
						<label htmlFor="topic">Sujet de votre demande</label>
						<select id="topic" name="topic" defaultValue="general" required>
							<option value="general">Question générale</option>
							<option value="game">À propos d&apos;un jeu</option>
							<option value="event">Événement / soirée jeux</option>
							<option value="shop">Boutique / distribution</option>
							<option value="other">Autre</option>
						</select>
					</div>

					<div className="form-group">
						<label htmlFor="message">Votre message</label>
						<textarea
							id="message"
							name="message"
							rows={5}
							required
							placeholder="Expliquez-nous en quelques lignes le contexte de votre demande."
						/>
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