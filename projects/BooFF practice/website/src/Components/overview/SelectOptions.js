

function SelectOptions({handleSelect, selected}) {

  return (
    <div className="buttonHolder">
          <button 
            className='selectButton' 
            value="matches" 
            style={{borderColor:selected === "matches" ? "#99092C":"#d7d7d7"}} 
            onClick={(e) => {handleSelect(e)}}
            >Matches
          </button>
          <button 
            className='selectButton' 
            value="referees"
            style={{borderColor:selected === "referees" ? "#99092C":"#d7d7d7"}}
            onClick={(e) => {handleSelect(e)}}
            >Referees
          </button>
          <button 
            className='selectButton' 
            value="coaches" 
            style={{borderColor:selected === "coaches" ? "#99092C":"#d7d7d7"}}
            onClick={(e) => {handleSelect(e)}}
            >Coaches
          </button>
          <button 
            className='selectButton' 
            value="admins" 
            style={{borderColor:selected === "admins" ? "#99092C":"#d7d7d7"}}
            onClick={(e) => {handleSelect(e)}}
            >Admins
          </button>
        </div>
  );
}

export default SelectOptions;