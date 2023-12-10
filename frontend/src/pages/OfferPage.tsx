import Button from "components/buttons/Button";
import axios from "utils/axios";
import { useEffect, useState } from "react";
import Navbar from "components/navbar/Navbar";
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useModal } from 'contexts/ModalProvider';
import Login from 'components/authetication/Login';
import ChangePassword from 'components/password-reset/ChangePassword';
import { Offer } from 'types/offer';
import UnitOffer from 'components/unit-offer/UnitOffer';
import { useDispatch, useSelector } from 'react-redux';
import NewOffer from 'components/new-offer/NewOffer';
import { setReload } from 'redux/reloadSlice';
import LoadingScreen from 'components/loading-screen/LoadingScreen';
import Keyword from "components/keyword/Keyword";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown, faArrowUp } from "@fortawesome/free-solid-svg-icons";
import Attachment from "components/attachment/Attachment";
import { ReactComponent as EditIcon } from '../images/edit-icon.svg';
import { ReactComponent as RemoveIcon } from '../images/remove-icon.svg';
import GeneralModal from "components/general-modal/GeneralModal";

const OfferPage = () => {
  const { id } = useParams();
  const { showModal } = useModal();
  const userInfo = useSelector((state: any) => state.auth.userInfo);
  const dispatch = useDispatch();
  const reload = useSelector((state: any) => state.reload);
  const [loading, setLoading] = useState<boolean>(true);
  const [offer, setOffer] = useState<Offer>({} as Offer);
  const [filesOpen, setFilesOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    getOffer();
  }, [id])

  useEffect(() => {
    if (!reload.location || reload.location !== "offerpage") return;
    getOffer();
    dispatch(setReload(""));
  }, [reload])

  const getOffer = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/offer/${id}`);
      if (!response.data) return;
      setOffer(response.data);
      setLoading(false);
    } catch {
      navigate("/");
    }
  };

  const linkify = (text: string) => {
    const urlRegex = /(\b((https?|ftp|file):\/\/|www\.)[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/ig;
    return text.replace(urlRegex, function(url) {
      return `<a href="${url.match(/^https?:/) ? url : '//' + url}" target="_blank" rel="noreferrer">${url}</a>`;
    });
  }

  const formatDescription = (description: string) => {
    if (!description) return;
    let newDescription: string | null = description;
    if (!newDescription.startsWith("<p>")) newDescription = "<p>" + newDescription;
    if (!newDescription.endsWith("</p>/n")) newDescription = newDescription + "</p>";
    return linkify(newDescription.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').replace(/<p>\s?<\/p>/g, '<br>').replace(/<em>/g, '<i>').replace(/<\/em>/g, '</i>').replace(/\\"/g, '"').replace(/\\n/g, ''));
  };

  const removeOffer = async () => {
    
  };

  return (
    <>
      <Navbar/>
      <div className="offer-page">
        {loading ? 
          <LoadingScreen upper/>
        :
          <>
            <header>
              <div className="header-buttons">
                <h1>{offer.name}</h1>
                {(userInfo.is_staff || userInfo.id === offer.author.id) &&
                  <>
                    <EditIcon className='edit-icon' onClick={() => showModal(<NewOffer offer={offer}/>)}/>
                    <RemoveIcon className='remove-icon' onClick={() => showModal(<GeneralModal text={"Opravdu chcete smazat nabídku?"} actionOnClick={removeOffer}/>)}/>
                  </>
                }
              </div>
              <h2>{offer.author.email}</h2>
            </header>
            <div className="keywords">
              <span className="keywords-span">Klíčová slova:</span>
              {offer.keywords.map((keyword, index) => {
                return (
                  <Keyword keyword={keyword} key={index}/>
                )
              })}
            </div>
            {offer.files.length > 0 &&
              <section className="files-wrapper">
                <div className="show-more" onClick={() => setFilesOpen(!filesOpen)}>
                  <span>Zobrazit přílohy ({offer.files.length})</span>{filesOpen ? <FontAwesomeIcon icon={faArrowUp}/> : <FontAwesomeIcon icon={faArrowDown}/>}
                </div>
                {filesOpen &&
                  <div className="files">
                    {offer.files.map((file, index) => {
                      return (
                        <Attachment attachment={file} key={index}/>
                      )
                    })}
                  </div>
                }
              </section>
            }
            <section className="description-wrapper">
              <h2>Popis nabídky:</h2>
              <div className="description" dangerouslySetInnerHTML={{__html: formatDescription(offer.description) || "<p></p>"}}></div>
            </section>
          </>
        }
      </div>
    </>
  )
};

export default OfferPage;