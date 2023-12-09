type KeywordProps = {
  keyword: string;
};

const Keyword = ({keyword}: KeywordProps) => {

  return (
    <div className="keyword">
      <span>{keyword}</span>
    </div>
  )
};

export default Keyword;