const SomethingWentWrong = () => (
	<div className="min-h-screen flex flex-col items-center justify-center bg-white">
		<h1 className="text-2xl font-semibold text-center mb-4">Něco se pokazilo.</h1>
		<p className="text-center mb-4">Omlouváme se, ale v tuto chvíli nemůžeme dokončit váš požadavek. Zkuste to prosím později.</p>
		<p className="text-center mb-4">Zde jsou některé věci, které můžete zkusit:</p>
		<ul className="list-disc list-inside text-left mb-4 px-4">
			<li>Zkontrolujte své připojení k internetu</li>
			<li>Zkuste obnovit stránku</li>
			<li>Pokud všechno ostatní selže, možná budete chtít kontaktovat náš tým podpory</li>
		</ul>
	</div>
);

export default SomethingWentWrong;
