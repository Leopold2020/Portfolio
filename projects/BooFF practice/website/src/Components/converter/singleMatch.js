import React from "react";

function SingleAccount({index, date, location, field, teams, changeData}) {
    
    function change(e) {
        console.log(e.target.value);
        changeData(index, e.target.name, e.target.value);
    }

    return (
        <tr>
            <td>
                {index}
            </td>
            <td>
                <input type="text" name="date" value={date} onChange={(e) => change(e)} />
            </td>
            <td>
                <input type="text" name="location" value={location} onChange={(e) => change(e)} />
            </td>
            <td>
                <input type="text" name="field" value={field} onChange={(e) => change(e)} />
            </td>
            <td>
                <input type="text" name="teams" value={teams} onChange={(e) => change(e)} />
            </td>
        </tr>
    );
}

export default SingleAccount;