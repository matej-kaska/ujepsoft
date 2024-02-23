type ProfileBadgeProps = {
	name: string;
	profilePicture: string;
	authorUjepsoft: string;
};

const ProfileBadge = ({ name, profilePicture, authorUjepsoft }: ProfileBadgeProps) => {
	return (
		<section className="profile-badge">
			<img src={profilePicture} className="picture" alt="profile" id="profilePicture" />
			<label className="name" htmlFor="profilePicture" id="profileName">
				{name}
				<label className="ujepsoft-email" htmlFor="profileName">
					{name === import.meta.env.VITE_GITHUB_USERNAME && authorUjepsoft !== "" && `(${authorUjepsoft})`}
				</label>
			</label>
		</section>
	);
};

export default ProfileBadge;
