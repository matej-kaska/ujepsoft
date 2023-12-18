import Button from "components/buttons/Button";
import axios from "utils/axios";
import { useEffect, useState } from "react";
import Navbar from "components/navbar/Navbar";
import { useSearchParams } from 'react-router-dom';
import { useModal } from 'contexts/ModalProvider';
import Login from 'components/authetication/Login';
import ChangePassword from 'components/password-reset/ChangePassword';
import { Offer } from 'types/offer';
import UnitOffer from 'components/unit-offer/UnitOffer';
import { useDispatch, useSelector } from 'react-redux';
import NewOffer from 'components/new-offer/NewOffer';
import { setReload } from 'redux/reloadSlice';
import { getOffersRowAmount } from 'utils/getUnitsRowAmount';
import LoadingScreen from 'components/loading-screen/LoadingScreen';

const HomePage = () => {
  const [searchParams] = useSearchParams();
  const { showModal } = useModal();
  const [loaded, setLoaded] = useState<boolean>(false);
  const userInfo = useSelector((state: any) => state.auth.userInfo);
  const [offers, setOffers] = useState<Offer[]>([]);
  const dispatch = useDispatch();
  const reload = useSelector((state: any) => state.reload);
  const [next, setNext] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const [connection, setConnection] = useState<string>("Click for check connection to backend...");
  const [connectionRedis, setConnectionRedis] = useState<string>("Click for check connection to Redis...");
  const [connectionSQL, setConnectionSQL] = useState<string>("Click for check connection to SQL...");

  useEffect(() => {
    setLoaded(true);
    getOffers();
  }, [])

  useEffect(() => {
    if (!reload.location || reload.location !== "offer") return;
    getOffers();
    dispatch(setReload(""));
  }, [reload])

  const getOffers = async () => {
    setLoading(true);
    const pageAmount = getOffersRowAmount() * 2;
    const response = await axios.get(`/api/offer/list?page-size=${pageAmount}`);
    if (!response.data) return;
    setOffers(response.data.results);
    setNext(response.data.next);
    setLoading(false);
  };

  const getMoreOffers = async () => {
    setLoading(true);
    const response = await axios.get(next);
    setOffers(prev => [...prev, ...response.data.results]);
    setNext(response.data.next);
    setLoading(false);
  };

  useEffect(() => {
    if (!searchParams) return;
    const token: string | null = searchParams?.get("token");
    const registration: string | null = searchParams?.get("registration");
    if (token) showModal(<ChangePassword token={token}/>);
    if (!registration) return;
    showModal(<Login token={registration}/>);
  }, [loaded])

  const checkConnection = async () => {
    try {
      const response = await axios.get("/api/test");
      setConnection(response.data.message);
    } catch {
      setConnection("Error");
    }
  };

  const checkConnectionRedis = async () => {
    try {
      const response = await axios.get("/api/redis");
      setConnectionRedis(response.data.message);
    } catch {
      setConnectionRedis("Error");
    }
  }

  const checkConnectionSQL = async () => {
    try {
      const response = await axios.get("/api/sql");
      setConnectionSQL(response.data.message);
    } catch {
      setConnectionSQL("Error");
    }
  }

  return (
    <>
      <Navbar/>
      <div className="homepage">
        <header>
          <h1>Nabídky pro Vývoj Softwaru na UJEP</h1>
          <p>
            Personál UJEP má možnost navrhovat softwarové projekty, které potřebují vyvinout. 
            Studenti mohou na tyto nabídky reagovat a zapojit se do vývoje, posíláním svých nápadů na uvedený e-mail. 
            Skvělá příležitost pro praktické zkušenosti a spolupráci mezi studenty a personálem.
          </p>
          {userInfo && userInfo.id &&
            <Button color='accent' onClick={() => showModal(<NewOffer/>)}>+ Přidat nabídku</Button>
          }
        </header>
        {offers.length === 0 && !loading ?
          <span className="mt-4 text-gray-600 italic">Nejsou zde žádné nabídky</span>
        :
          <section className='offer-container'>
            {offers.map((offer: Offer, index: number) => (
              <UnitOffer offer={offer} key={index}/>
            ))}
          </section>
        }
        {loading ? 
          <LoadingScreen upper/>
        :
          <>
            {next && <Button color="accent" onClick={getMoreOffers}>Načíst další</Button>}
          </>
        }
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <p>{connection}</p>
        <Button onClick={checkConnection}>Check</Button>
        <p>{connectionRedis}</p>
        <Button onClick={checkConnectionRedis}>Check</Button>
        <p>{connectionSQL}</p>
        <Button onClick={checkConnectionSQL}>Check</Button>
      </div>
    </>
  )
};

export default HomePage;