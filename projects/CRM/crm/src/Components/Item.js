import "./Item.css";

function Item(props) {
  return (
    <>
      <div className="dropdown">
        <div className="company-name">{props.data.name}</div>
        <div className="dropdown-content">
          <div className="dropdown-layout">
            <div className="desc">{props.data.information}</div>
            <div className="desc">{props.data.phone}</div>
            <div className="desc">{props.data.email}</div>
          </div>
          <div
            className="dropdown-status"
            id="circle"
            style={{
              backgroundColor:
                props.data.status === "yellow"
                  ? "yellow"
                  : props.data.status === "green"
                  ? "green"
                  : props.data.status === "red"
                  ? "red"
                  : "white",
            }}
          />
        </div>
      </div>

      <div className="date">{props.data.toCall}</div>
    </>
  );
}

export default Item;
