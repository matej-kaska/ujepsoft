import Button from "components/buttons/Button";
import Navbar from "components/navbar/Navbar";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from "utils/axios";
import { urlGithubSchema } from "utils/validationSchemas";
import { Repo } from "types/repo";
import LoadingScreen from "components/loading-screen/LoadingScreen";
import ProfileBadge from "components/profile-badge/ProfileBadge";
import { useSnackbar } from "contexts/SnackbarProvider";
import { ReactComponent as RemoveIcon } from '../images/remove-icon.svg';
import { useModal } from "contexts/ModalProvider";
import GeneralModal from "components/general-modal/GeneralModal";

type AddRepoForm = {
  url: string;
  apiError?: string;
}

const AdministrationPage = () => {
  const [successfullySubmitted, setSuccessfullySubmitted] = useState<boolean>(false);
  const [loadedRepos, setLoadedRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingAdd, setLoadingAdd] = useState<boolean>(false);
  const userInfo = useSelector((state: any) => state.auth.userInfo);
  const navigate = useNavigate();
  const { openErrorSnackbar, openSnackbar } = useSnackbar();
  const { showModal, closeModal } = useModal();

  useEffect(() => {
    if (!userInfo.is_staff) navigate("/");
    loadRepos();
  }, [])

  const addRepoFormSchema = yup.object().shape({
    url: urlGithubSchema
  });

  const {setError, register, handleSubmit, formState: { errors } } = useForm<AddRepoForm>({ 
    resolver: yupResolver(addRepoFormSchema)
  });

  const loadRepos = async () => {
    try {
      const response = await axios.get("/api/repo/list");
      setLoadedRepos(response.data);
      setLoading(false);
    } catch {
      openErrorSnackbar("Někde nastala chyba zkuste to znovu!");
      navigate("/");
    }
  };

  const addRepo = async (data: AddRepoForm) => {
    setSuccessfullySubmitted(false);
    setLoadingAdd(true);
    await axios.post("/api/repo", {url: data.url})
    .then(() => {
      setSuccessfullySubmitted(true);
      setLoadingAdd(false);
      loadRepos();
    })
    .catch((error: any) => {
      setLoadingAdd(false);
      console.error(error);
      if (error.response.data.cz) {
        setError("apiError", {type: "server", message: error.response.data.cz});
      } else {
        setError("apiError", {type: "server", message: "Někde nastala chyba zkuste to znovu"});
      }
    });
  };

  const removeRepo = async (repoId: number) => {
    closeModal();
    try {
      await axios.delete(`/api/repo/${repoId}`);
      openSnackbar('Repozitář byl úspěšně smazán z databáze!');
      loadRepos();
    } catch (error: any) {
      console.error(error);
      if (error.response.data.cz) {
        openErrorSnackbar(error.response.data.cz);
      } else {
        openErrorSnackbar("Někde nastala chyba zkuste to znovu!");
      }
    }
  };

  return (
    <>
    <Navbar/>
      <section className="administration-page">
        <header>
          <h1>Administrace UJEP Soft</h1>
        </header>
        <section className="repos-wrapper">
          <form className="add-new" onSubmit={handleSubmit(addRepo)}>
            <h2>Přidat nový repozitář</h2>
            <div className="input-wrapper">
              <input type="text" className="new-repo" {...register("url")} onChange={() => successfullySubmitted && setSuccessfullySubmitted(false)}/>
              <Button className="add-button" type="submit">Přidat</Button>
            </div>
            <div className="loading-status">
              {loadingAdd ? 
                <>
                  <LoadingScreen />
                  <p className="loading-p">Přidávání repozitáře do databáze...</p>
                </>
              :
                <>
                  <p className={`${(errors.url || errors.apiError) ? "visible" : "invisible"} text-sm text-red-600`}>{errors.url ? errors.url.message : errors.apiError?.message}!</p>
                  <p className={`${successfullySubmitted ? "visible" : "invisible"} text-sm text-green-600 success`}>Repozitář byl úspěšně přidán do databáze!</p>
                </>
              }
            </div>
          </form>
          <section className="repos-list-wrapper">
            <h2>Seznam repozitářů</h2>
            <ul className="repos-list">
              {loading ?
                <div className="flex flex-row items-center">
                  <LoadingScreen upper />
                  <span className="ml-3 text-gray-600 italic">Načítání repozitářů a zjišťování statusu collaboranta</span>
                </div>
              :
                <>
                  {loadedRepos && loadedRepos.length === 0 && <li className="ml-0.5 text-gray-600 italic">Žádné repozitáře nebyly nalezeny</li>}
                  {loadedRepos && loadedRepos.map((repo, index) => 
                    <li key={index} className="repo">
                      <ProfileBadge name={repo.author} profilePicture={repo.author_profile_pic}/>
                      <span>{repo.name}</span>
                      <Link to={repo.url} target="_blank" rel="noopener noreferrer">URL odkaz</Link>
                      <RemoveIcon className='remove-icon' onClick={() => showModal(<GeneralModal text={"Opravdu chcete smazat repozitář z databáze?"} actionOnClick={() => removeRepo(repo.id)}/>)}/>
                      {!repo.collaborant && <span className="text-red-700">UJEP není collaborantem repozitáře!</span>}
                    </li>
                  )}
                </>
              }
            </ul>
          </section>
        </section>
      </section>
    </>
  )
};

export default AdministrationPage;