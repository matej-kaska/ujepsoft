import Button from "components/buttons/Button";
import Keyword from "components/keyword/Keyword";
import { Offer } from "types/offer";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { faFile } from '@fortawesome/free-regular-svg-icons';
import { Link } from "react-router-dom";
import { htmlToPlainText } from "utils/htmlToPlainText";
import Tooltip from "components/tooltip/Tooltip";

type UnitOfferProps = {
  offer: Offer;
};

const UnitOffer = ({offer}: UnitOfferProps) => {

  return (
    <section className="unit-offer">
      <h2 className="unit-title"><Link to={`/offer/${offer.id}`}>{offer.name}</Link></h2>
      <h3 className="unit-author">{offer.author.email}</h3>
      <section className="unit-keywords">
        {offer.keywords.map((keyword, index) => {
          return (
            <Keyword keyword={keyword} key={index}/>
          )
        })}
      </section>
      <p className="unit-description">{htmlToPlainText(offer.description)}</p>
      <div className="unit-footer">
        {offer.files.length > 0 && 
          <Tooltip text={`Nabídka obsahuje ${offer.files.length} ${offer.files.length === 1 ? "přílohu" : offer.files.length > 4 ? "příloh" : "přílohy"}`}><FontAwesomeIcon icon={faFile}/></Tooltip>
        }
        <Link to={`/offer/${offer.id}`}><Button icon={<FontAwesomeIcon icon={faChevronRight}/>}  iconPosition="right">Zobrazit</Button></Link>
      </div>
    </section>
  )
};

export default UnitOffer;