const Footer = () => {
	return (
		<footer className="footer">
			<p>
				<span className="footer-copy">
					© 2025 - {new Date().getFullYear()} Dare To Roll — Tous droits réservés
				</span>
				<span className="footer-links">
					<a href="/conditions-generales-de-vente">
						Conditions Générales de Vente
					</a>
				</span>
			</p>
		</footer>
	)
}

export default Footer;