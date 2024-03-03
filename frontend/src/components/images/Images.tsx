import { Attachment as FileProps } from "types/offer";

const Images = ({ images }: { images: FileProps[] }) => {
	return (
		<>
			{images.length > 0 && (
				<section className="images-wrapper">
					<h2>Obrázky:</h2>
					<div className="images">
						{images.map((image, index) => {
							return (
								<div className="image-wrapper" key={index}>
									<img alt={image.name} src={image.file ? image.file : image.remote_url} />
									<span className="image-title">{image.name}</span>
								</div>
							);
						})}
					</div>
				</section>
			)}
		</>
	);
};
export default Images;
