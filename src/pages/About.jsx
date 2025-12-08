export default function About() {
	return (
		<section className="page about-page">
			<header className="page-header">
				<h1 className="page-title">À propos de Dare to Roll</h1>
				<p className="page-subtitle">
					Un petit studio basé à Monaco, dédié aux jeux de société.
				</p>
			</header>

			<div className="about-layout">
				<div className="about-text">
					<p>
						Dare to Roll est un studio de création et d&apos;édition de jeux de société fondé à
						Monaco par des passionnés. Nous concevons des expériences de jeu où les décisions
						laissent des traces, et où chaque partie raconte une petite histoire différente.
					</p>

					<p>
						De l&apos;idée initiale aux premiers prototypes, des soirées tests aux ajustements
						finaux, nous travaillons nos jeux directement sur le terrain, avec des joueurs
						qui aiment autant réfléchir que rire. Notre objectif est simple&nbsp;: proposer des
						jeux accessibles, mais suffisamment subtils pour donner envie d&apos;y revenir.
					</p>

					<p>
						Nous tenons aussi à une production locale et maîtrisée, afin de limiter
						les intermédiaires et d&apos;assumer pleinement chaque détail qui sort de nos boîtes.
					</p>
				</div>

				<aside className="about-team card">
					<p className="about-team-title">L&apos;équipe Dare to Roll</p>
					<p className="about-team-text">
						Derrière nos jeux, une petite équipe soudée qui conçoit, teste, discute et affine
						chaque mécanique.
					</p>

					<div className="about-team-photo-placeholder">
						<span>Photo de l&apos;équipe à venir</span>
					</div>
				</aside>
			</div>
		</section>
	)
}