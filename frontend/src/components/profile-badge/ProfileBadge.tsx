type ProfileBadgeProps = {
	name: string;
	profilePicture: string;
};

const ProfileBadge = ({ name, profilePicture }: ProfileBadgeProps) => {
	return (
		<section className="profile-badge">
			<img src={profilePicture} className="picture" alt="profile" id="profilePicture" />
			<label className="name" htmlFor="profilePicture">
				{name}
			</label>
		</section>
	);
};

export default ProfileBadge;
