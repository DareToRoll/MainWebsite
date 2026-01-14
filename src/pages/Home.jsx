import homeContent from '../content/home.json';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import { getGameImage } from '../utils/gameImages';

export default function Home() {
	const navigate = useNavigate();
	const { hero, featuredGame } = homeContent;

	const handleGoToShop = () => {
		navigate('/shop')
	}

	const handleGoToFeatured = () => {
		if (featuredGame.slug) {
			navigate(`/shop/${featuredGame.slug}`)
		}
	}

	const featuredGameImage = getGameImage(featuredGame.slug)
	
	return (
		<section className="page home-page">
			{/* HERO */}
			<div className="home-hero">
				<div className="home-hero-text">
					<div className="home-hero-badges">
						{hero.badges.map((badge, index) => (
							<span
								key={index}
								className={
									'badge' +
									(badge.variant === 'accent' ? ' badge-accent' : '')
								}
							>
								{badge.text}
							</span>
						))}
					</div>

					<h1 className="page-title">
						{hero.title}
					</h1>

					<p className="page-subtitle">
						{hero.subtitle}
					</p>

					<ul className="home-hero-list">
						{hero.listItems.map((item, index) => (
							<li key={index}>{item}</li>
						))}
					</ul>

					<div className="home-hero-actions">
						<button className="btn btn-primary" onClick={handleGoToShop}>
							{hero.primaryCtaLabel}
						</button>
					</div>

					{/* <div className="home-hero-meta">
						<div className="home-hero-meta-item">
							<p className="home-hero-meta-label">Jeux en préparation</p>
							<p className="home-hero-meta-value">3 créations originales</p>
						</div>
						<div className="home-hero-meta-item">
							<p className="home-hero-meta-label">Production</p>
							<p className="home-hero-meta-value">100 % locale à Monaco</p>
						</div>
						<div className="home-hero-meta-item">
							<p className="home-hero-meta-label">Soirées tests</p>
							<p className="home-hero-meta-value">+ de 20 par an</p>
						</div>
					</div> */}
				</div>

				<div className="home-hero-featured card home-hero-featured-clickable" onClick={handleGoToFeatured} role="button" tabIndex={0}>
					<div className="home-featured-header">
						<p className="home-featured-label">Jeu vedette</p>
						{/* <p className="home-featured-status">{featuredGame.status}</p> */}
					</div>

					<h2 className="home-featured-title">{featuredGame.title}</h2>
					<p className="home-featured-tagline">{featuredGame.tagline}</p>

					<div className="home-featured-carousel">
						{featuredGameImage ? (
							<img 
								src={featuredGameImage} 
								alt={featuredGame.title}
								className="home-featured-carousel-image"
							/>
						) : (
							<div className="home-featured-carousel-placeholder">
								Aperçu visuel du jeu
							</div>
						)}
					</div>

					<div className="home-featured-meta">
						<span>{featuredGame.players}</span>
						<span>{featuredGame.duration}</span>
						<span>{featuredGame.age}</span>
					</div>

					<p className="home-featured-text">
						{featuredGame.description}
					</p>

					<div className="home-featured-footer">
						<div className="home-featured-price-wrap">
							<span className="home-featured-price">{featuredGame.price}</span>
							<span className="home-featured-price-note">TTC</span>
						</div>
					</div>

					{featuredGame.note && (
						<span className="home-featured-note">
							{featuredGame.note}
						</span>
					)}
				</div>
			</div>

			{/* SECTION – NOS JEUX */}
			{/* <section className="home-section">
				<header className="home-section-header">
					<h2>Nos jeux de société</h2>
					<p>
						Chaque jeu est imaginé, prototypé et peaufiné par notre équipe, avec
						une seule idée en tête : créer des souvenirs autour de la table.
					</p>
				</header>

				<div className="grid grid-3 home-games-grid">
					{games.map((game) => (
						<div key={game.title} className="card">
							<p className="card-title">{game.title}</p>
							<p className="card-meta">{game.description}</p>
							{game.price && (
								<p className="home-card-price">{game.price}</p>
							)}
							<p className="home-card-line">
								<strong>{game.line.split('·')[0].trim()}</strong>
								{' · '}
								{game.line.split('·').slice(1).join('·').trim()}
							</p>
						</div>
					))}
				</div>
			</section> */}

			{/* SECTION – ÉVÉNEMENTS */}
			{/* <section className="home-section">
				<header className="home-section-header">
					<h2>Événements & rencontres</h2>
					<p>
						Nous venons présenter nos prototypes, animer des tables de jeu et
						échanger avec les joueurs dans différents salons et cafés ludiques.
					</p>
				</header>

				<div className="home-timeline">
					{events.map((event) => (
						<div key={event.id} className="home-timeline-item">
							<div className="home-timeline-date">{event.date}</div>
							<div className="home-timeline-content">
								<p className="home-timeline-title">{event.title}</p>
								<p className="home-timeline-text">{event.text}</p>
							</div>
						</div>
					))}
				</div>
			</section> */}

			{/* SECTION – ARTICLES / JOURNAL */}
			{/* <section className="home-section">
				<header className="home-section-header">
					<h2>Journal de création</h2>
					<p>
						Coulisses, prototypage, tests, itérations : nous partageons notre
						quotidien de créateurs de jeux indépendants.
					</p>
				</header>

				<div className="grid grid-3 home-articles-grid">
					{articles.map((article) => (
						<article key={article.id} className="card">
							<p className="card-title">{article.title}</p>
							<p className="card-meta">{article.description}</p>
						</article>
					))}
				</div>
			</section> */}
		</section>
	)
}