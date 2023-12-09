import Button from "components/buttons/Button";
import Keyword from "components/keyword/Keyword";
import { Offer } from "types/offer";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Link } from "react-router-dom";

type UnitOfferProps = {
  offer: Offer;
};

const UnitOffer = ({offer}: UnitOfferProps) => {

  return (
    <section className="unit-offer">
      <h2 className="unit-title"><Link to={`/offer/${offer.id}`}>{offer.title}</Link></h2>
      <h3 className="unit-author">{offer.author_email}</h3>
      <section className="unit-keywords">
        {offer.keywords.map((keyword, index) => {
          return (
            <Keyword keyword={keyword} key={index}/>
          )
        })}
      </section>
      <p className="unit-description">{offer.description}</p>
      <div className="unit-footer">
        <Button icon={<FontAwesomeIcon icon={faChevronRight}/>}  iconPosition="right">Zobrazit</Button>
      </div>
    </section>
  )
};

export default UnitOffer;