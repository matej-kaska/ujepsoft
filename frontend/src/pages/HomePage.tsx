import "./HomePage.scss";
import { ReactComponent as CloseIcon } from 'images/close.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import Button from "components/buttons/Button";
import axios from "utils/axios";
import { useState } from "react";

const HomePage = () => {
  const [connection, setConnection] = useState<string>("Click for check connection to backend...");
  const [connectionRedis, setConnectionRedis] = useState<string>("Click for check connection to Redis...");
  const [connectionSQL, setConnectionSQL] = useState<string>("Click for check connection to SQL...");

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