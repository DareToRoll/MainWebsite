import './About.css';

export default function About() {
	return (
		<section className="page about-page">
			<header className="page-header">
				<h1 className="page-title">À propos de Dare to Roll</h1>
				<p className="page-subtitle">
					Un studio monégasque qui transforme des idées en jeux de société, un projet à la fois.
				</p>
			</header>

			<div className="about-layout">
				<div className="about-text">
					<p>
						Dare to Roll, c&apos;est un studio né à Monaco de l&apos;envie de créer des jeux qu&apos;on
						aime partager. On aime les mécaniques où vos choix comptent, où chaque partie raconte
						sa propre petite histoire et où on a envie de rejouer pour découvrir de nouveaux chemins.
					</p>

					<p>
						Du premier croquis griffonné sur un coin de table aux ajustements finaux après des
						parties de test, on développe nos jeux en vrai, avec de vrais joueurs qui n&apos;hésitent
						pas à nous dire quand quelque chose ne fonctionne pas. Des jeux accessibles, pensés pour
						être rapidement compris, avec l&apos;envie d&apos;explorer différentes approches au fil
						de nos créations.
					</p>

					<p>
						Et parce qu&apos;on tient à maîtriser chaque aspect, de la règle au graphisme en passant
						par la production, on fait tout localement à Monaco. Moins d&apos;intermédiaires, plus
						de contrôle, et surtout la satisfaction de produire près de chez nous, en étant présents
						à chaque étape.
					</p>
				</div>

				<aside className="about-team card">
					<p className="about-team-title">L&apos;équipe Dare to Roll</p>
					<p className="about-team-text">
						Derrière chaque jeu, une petite équipe qui teste, discute et affine chaque mécanique,
						toujours à l&apos;écoute des retours pour s&apos;améliorer.
					</p>

					<div className="about-team-photo-placeholder">
						<span>Photo de l&apos;équipe à venir</span>
					</div>
				</aside>
			</div>
		</section>
	)
}