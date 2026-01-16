import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

const signInSchema = z.object({
	email: z
		.string()
		.min(1, 'L\'adresse e-mail est obligatoire')
		.email({ message: 'Adresse e-mail invalide' }),
	password: z
		.string()
		.min(1, 'Le mot de passe est obligatoire')
		.min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
})

const signUpSchema = signInSchema.extend({
	confirmPassword: z
		.string()
		.min(1, 'La confirmation du mot de passe est obligatoire'),
}).refine((data) => data.password === data.confirmPassword, {
	message: 'Les mots de passe ne correspondent pas',
	path: ['confirmPassword'],
})

export default function Auth() {
	const [searchParams, setSearchParams] = useSearchParams()
	const navigate = useNavigate()
	const { signUp, signIn } = useAuth()
	const mode = searchParams.get('mode') || 'signin'
	const [authMode, setAuthMode] = useState(mode === 'signup' ? 'signup' : 'signin')
	const [status, setStatus] = useState(null)

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
	} = useForm({
		resolver: zodResolver(authMode === 'signup' ? signUpSchema : signInSchema),
	})

	useEffect(() => {
		const urlMode = searchParams.get('mode')
		if (urlMode === 'signup' || urlMode === 'signin') {
			setAuthMode(urlMode)
		}
	}, [searchParams])

	const switchMode = (newMode) => {
		setAuthMode(newMode)
		setSearchParams({ mode: newMode }, { replace: true })
		setStatus(null)
		reset()
	}

	const onSubmit = async (data) => {
		setStatus(null)

		try {
			if (authMode === 'signup') {
				const signUpData = await signUp(data.email.trim(), data.password)

				if (signUpData.user) {
					setStatus({
						type: 'success',
						message: signUpData.user.email_confirmed_at
							? 'Compte créé avec succès !'
							: 'Compte créé avec succès ! Vérifiez votre e-mail pour confirmer votre compte.',
					})
					reset()
					if (signUpData.user.email_confirmed_at) {
						setTimeout(() => navigate('/'), 1500)
					}
				}
			} else {
				await signIn(data.email.trim(), data.password)
				navigate('/')
			}
		} catch (error) {
			console.error(error)
			let errorMessage = error.message || (authMode === 'signup'
				? 'Une erreur s\'est produite lors de la création du compte. Veuillez réessayer.'
				: 'Identifiants incorrects. Veuillez réessayer.')

			if (error.message?.includes('already registered')) {
				errorMessage = 'Cette adresse e-mail est déjà utilisée. Essayez de vous connecter.'
			} else if (error.message?.includes('Invalid login credentials')) {
				errorMessage = 'Identifiants incorrects. Veuillez réessayer.'
			} else if (error.message?.includes('Password')) {
				errorMessage = 'Le mot de passe doit contenir au moins 6 caractères.'
			}

			setStatus({
				type: 'error',
				message: errorMessage,
			})
		}
	}

	return (
		<section className="page auth-page">
			<header className="page-header">
				<h1 className="page-title">Authentification</h1>
				<p className="page-subtitle">
					Connectez-vous à votre compte ou créez-en un nouveau pour accéder à votre espace.
				</p>
			</header>

			<div className="auth-container">
				<div className="auth-tabs">
					<button
						type="button"
						className={`auth-tab ${authMode === 'signin' ? 'active' : ''}`}
						onClick={() => switchMode('signin')}
						aria-pressed={authMode === 'signin'}
						aria-controls="auth-form"
					>
						Connexion
					</button>
					<button
						type="button"
						className={`auth-tab ${authMode === 'signup' ? 'active' : ''}`}
						onClick={() => switchMode('signup')}
						aria-pressed={authMode === 'signup'}
						aria-controls="auth-form"
					>
						Inscription
					</button>
				</div>

				<form
					id="auth-form"
					className="auth-form card"
					onSubmit={handleSubmit(onSubmit)}
					noValidate
				>
					<div className="form-group">
						<label htmlFor="email">Adresse e-mail</label>
						<input
							id="email"
							type="email"
							placeholder="vous@exemple.com"
							autoComplete="email"
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
						<label htmlFor="password">Mot de passe</label>
						<input
							id="password"
							type="password"
							placeholder={authMode === 'signup' ? 'Au moins 6 caractères' : 'Votre mot de passe'}
							autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
							aria-invalid={errors.password ? 'true' : 'false'}
							aria-describedby={errors.password ? 'password-error' : undefined}
							{...register('password')}
						/>
						{errors.password && (
							<span id="password-error" className="form-error" role="alert">
								{errors.password.message}
							</span>
						)}
					</div>

					{authMode === 'signup' && (
						<div className="form-group">
							<label htmlFor="confirmPassword">Confirmer le mot de passe</label>
							<input
								id="confirmPassword"
								type="password"
								placeholder="Répétez le mot de passe"
								autoComplete="new-password"
								aria-invalid={errors.confirmPassword ? 'true' : 'false'}
								aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
								{...register('confirmPassword')}
							/>
							{errors.confirmPassword && (
								<span id="confirmPassword-error" className="form-error" role="alert">
									{errors.confirmPassword.message}
								</span>
							)}
						</div>
					)}

					<button type="submit" className="btn btn-primary" disabled={isSubmitting}>
						{isSubmitting
							? 'Traitement en cours...'
							: authMode === 'signup'
								? 'Créer mon compte'
								: 'Se connecter'}
					</button>

					{status && (
						<p
							className={
								status.type === 'success'
									? 'auth-status auth-status-success'
									: 'auth-status auth-status-error'
							}
							role="alert"
						>
							{status.message}
						</p>
					)}
				</form>
			</div>
		</section>
	)
}
