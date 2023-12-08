import { Offer } from "types/offer";

type UnitOfferProps = {
  offer: Offer;
};

const UnitOffer = ({offer}: UnitOfferProps) => {


  return (
    <section className="unit-offer">
      <h2>{offer.title}</h2>
      <h3>{offer.author_email}</h3>
      <section className="unit-keywords"></section>
      <p>{offer.description}</p>
    </section>
  )
};

export default UnitOffer;