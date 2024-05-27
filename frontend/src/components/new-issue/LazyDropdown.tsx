import React, { Suspense, startTransition } from 'react';
import Dropdown from 'components/dropdown/Dropdown';
import { RepoSelect } from 'types/repo';
import { FullIssue } from 'types/issue';

const LaziedDropdown = React.lazy(() => import("components/dropdown/Dropdown"));

type LazyDropdownProps = {
  selectValue: number;
  repos: RepoSelect[];
  errors: any;
  hoverSelect: boolean;
  setSelectValue: React.Dispatch<React.SetStateAction<number>>;
  issue?: FullIssue;
};

const LazyDropdown = ({ selectValue, repos, errors, hoverSelect, issue, setSelectValue }: LazyDropdownProps) => {

  const handleSelect = (id: number) => {
    startTransition(() => {
      setSelectValue(id);
    });
  };

  return (
    <Suspense fallback={<div className="loading-dropdown">Načítám aplikace...</div>}>
      <LaziedDropdown
        label={selectValue !== 0 ? (repos.find((repo: RepoSelect) => repo.id === selectValue) || { name: "Vyberte aplikaci..." }).name : "Vyberte aplikaci..."}
        className={`select ${errors.repo ? "border-red-600" : ""} ${selectValue !== 0 ? "" : "unselected"} ${hoverSelect ? "darken" : ""}`}
        defaultClasses={false}
        menuClasses="options"
        disabled={issue ? true : false}
      >
        {repos.map((repo: RepoSelect, index: number) => {
          return (
            <Dropdown.Item key={index} onClick={() => handleSelect(repo.id)}>
              {repo.name}
            </Dropdown.Item>
          );
        })}
      </LaziedDropdown>
    </Suspense>
  );
}

export default LazyDropdown;