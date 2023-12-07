import { ReactComponent as CloseIcon } from 'images/close.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import Button from "components/buttons/Button";
import axios from "utils/axios";
import { useEffect, useState } from "react";
import Navbar from "components/navbar/Navbar";
import { useSearchParams } from 'react-router-dom';
import { useModal } from 'contexts/ModalProvider';
import Login from 'components/authetication/Login';
import ChangePassword from 'components/password-reset/ChangePassword';

const HomePage = () => {
  const [searchParams] = useSearchParams();
  const { showModal } = useModal();
  const [loaded, setLoaded] = useState<boolean>(false);


  const [connection, setConnection] = useState<string>("Click for check connection to backend...");
  const [connectionRedis, setConnectionRedis] = useState<string>("Click for check connection to Redis...");
  const [connectionSQL, setConnectionSQL] = useState<string>("Click for check connection to SQL...");

  useEffect(() => {
    setLoaded(true);
  }, [])

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
      console.log(response)
      setConnectionSQL(response.data.message);
    } catch {
      setConnectionSQL("Error");
    }
  }

  return (
    <div className="homepage">
      <Navbar/>
      <p>HOMEPAGE</p>
      <p>{connection}</p>
      <Button onClick={checkConnection}>Check</Button>
      <p>{connectionRedis}</p>
      <Button onClick={checkConnectionRedis}>Check</Button>
      <p>{connectionSQL}</p>
      <Button onClick={checkConnectionSQL}>Check</Button>
      <CloseIcon />
      <FontAwesomeIcon icon={faChevronDown} className="ml-2 h-3" />
    </div>
  )
};

export default HomePage;