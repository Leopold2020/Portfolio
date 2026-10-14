import React from "react";

function SingleAccount({index, firstname, lastname, email, phone, changeData}) {
    
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
                <input type="text" name="firstname" value={firstname} onChange={(e) => change(e)} />
            </td>
            <td>
                <input type="text" name="lastname" value={lastname} onChange={(e) => change(e)} />
            </td>
            <td>
                <input type="text" name="email" value={email} onChange={(e) => change(e)} />
            </td>
            <td>
                <input type="text" name="phone" value={phone} onChange={(e) => change(e)} />
            </td>
        </tr>
    );
}

export default SingleAccount;