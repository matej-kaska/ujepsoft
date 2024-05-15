import { useState } from "react";

const ScreenshotGuideMacOS = () => {
	const [open, setOpen] = useState(false);

	return (
		<div className={`guide ${open ? "open" : ""}`}>
			<h2 onClick={() => setOpen(!open)}>Jak udělat screenshot? (macOS)</h2>
			{open && (
				<ol>
					<li>
						Stiskněte <strong>Command (⌘) + Shift + 4</strong>
					</li>
					<li>Kurzor se změní na křížek</li>
					<li>Klikněte a táhněte pro výběr oblasti, kterou chcete zachytit</li>
					<img src="/src/images/guides/Screenshot-2021-10-22-at-5.38.23-PM-1024x640.webp" alt="screenshot" />
					<li>Uvolněte tlačítko myši pro pořízení snímku</li>
					<li>Snímek obrazovky bude ve výchozím nastavení uložen na vaší ploše</li>
				</ol>
			)}
		</div>
	);
};

export default ScreenshotGuideMacOS;
