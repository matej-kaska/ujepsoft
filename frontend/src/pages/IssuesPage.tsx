import Button from "components/buttons/Button";
import axios from "utils/axios";
import { useEffect, useState } from "react";
import Navbar from "components/navbar/Navbar";
import { useModal } from 'contexts/ModalProvider';
import { useDispatch, useSelector } from 'react-redux';
import { setReload } from 'redux/reloadSlice';
import LoadingScreen from 'components/loading-screen/LoadingScreen';
import { Issue } from "types/issue";
import UnitIssue from "components/unit-issue/UnitIssue";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "contexts/SnackbarProvider";

const IssuesPage = () => {
  const { showModal } = useModal();
  const [issues, setIssues] = useState<Issue[]>([]);
  const dispatch = useDispatch();
  const reload = useSelector((state: any) => state.reload);
  const [next, setNext] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [closed, setClosed] = useState<boolean>(false);
  const navigate = useNavigate();
  const {openErrorSnackbar} = useSnackbar();

  useEffect(() => {
    getIssues();
  }, [])

  useEffect(() => {
    if (!reload.location || reload.location !== "issues") return;
    getIssues();
    dispatch(setReload(""));
  }, [reload])

  const getIssues = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/issue/list`);
      if (!response.data) return;
      setIssues(response.data.results);
      setNext(response.data.next);
      setLoading(false);
    } catch {
      openErrorSnackbar("Někde nastala chyba zkuste to znovu!");
      navigate("/");
    }
  };

  const getMoreIssues = async () => {
    setLoading(true);
    const response = await axios.get(next);
    setIssues(prev => [...prev, ...response.data.results]);
    setNext(response.data.next);
    setLoading(false);
  };

  return (
    <>
      <Navbar/>
      <div className="issues-page">
        <header>
          <h1>Pohledávky (Issues)</h1>
          <p>
            XXX
          </p>
          <div className="footer-header">
            <div className="switch-wrapper">
              <label className="switch" htmlFor="toggle">
                <input type="checkbox" id="toggle" defaultChecked={!closed} onClick={() => setClosed(!closed)}/>
                <span className="slider"></span>
              </label>
              <span className="text">Nezobrazovat uzavřené</span>
            </div>
            <Button color='accent' onClick={() => console.log("add issue")}>+ Přidat pohledávku</Button>
            <div className="spacer"/>
          </div>
        </header>
        {issues && issues.length === 0 && !loading ?
          <span className="mt-4 text-gray-600 italic">Nejsou zde žádné pohledávky</span>
        :
          <section className='issues-container'>
            {issues && issues.map((issue: Issue, index: number) => {
              if (!closed && issue.state === "closed") return;

              return (
                <UnitIssue issue={issue} key={index}/>
              )
            })}
          </section>
        }
        {loading ? 
          <LoadingScreen upper/>
        :
          <>
            {next && <Button color="accent" className="load-more" onClick={getMoreIssues}>Načíst další</Button>}
          </>
        }
      </div>
    </>
  )
};

export default IssuesPage;