import SadFace from "images/sad-face.svg?react";

const SomethingWentWrong = () => (
	<div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
		<SadFace className="w-32 h-32 mb-4" />
		<div className="flex flex-col items-center justify-center">
			<h1 className="text-3xl font-bold text-center mb-4">Něco se pokazilo.</h1>
			<p className="text-center mb-4 text-lg">Omlouváme se, ale v tuto chvíli nemůžeme dokončit váš požadavek. Zkuste to prosím později.</p>
			<p className="text-center mb-4 text-lg">Zde jsou některé věci, které můžete zkusit:</p>
			<ul className="list-disc list-inside text-left mb-4 px-6 text-lg">
				<li>Zkontrolujte své připojení k internetu</li>
				<li>Zkuste obnovit stránku</li>
				<li>Zkuste vymazat mezipaměť prohlížeče a cookies</li>
				<li>Kontaktujte podporu, pokud problém přetrvává</li>
			</ul>
		</div>
	</div>
);

export default SomethingWentWrong;
