import React, { useState } from "react";
import * as XLSX from "xlsx";
import SingleAccount from "../../Components/converter/singleAccount";

function ExcelToJsonConverter({axiosJWT}) {
  const [file, setFile] = useState(null);
  // const [jsonData, setJsonData] = useState("");
  const [roles, setRoles] = useState(undefined);
  const [data, setData] = useState([]);
  const [keyValueName, setKeyValueName] = useState({
    firstname: "firstname",
    lastname: "lastname",
    email: "email",
    phone: "phone"
  });

  function handleInputChange(e) {
    setKeyValueName({
      ...keyValueName,
      [e.target.name]: e.target.value
    });
  }

  const handleConvert = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        const newJson = test(json, keyValueName.firstname, keyValueName.lastname, keyValueName.email, keyValueName.phone);
        setData(newJson);
      };
      reader.readAsBinaryString(file);
    }
  };

  function test(original, firstname, lastname, email, phone) {
    try {
      let newJson = [];
      for (let i = 0; i < original.length; i++) {
        newJson.push({
          firstname: original[i][firstname],
          lastname: original[i][lastname],
          email: original[i][email],
          phone: (original[i][phone] === '' || original[i][phone] === undefined ? "" : original[i][phone]),
          issues: [
            (original[i][firstname] === '' || original[i][firstname] === undefined ? {issue: "firstname is missing"} : null),
            (original[i][lastname] === '' || original[i][lastname] === undefined ? {issue: "lastname is missing"} : null),
            (original[i][email] === '' || original[i][email] === undefined ? {issue: "email is missing"} : null),
          ]
        })
      }
      console.log(newJson)
      return newJson;

    } catch (error) {
      console.log(error.message)
    }
  }

  function prepereToSend(original) {
    try {
      let newJson = [];
      for (let i = 0; i < original.length; i++) {
        newJson.push({
          firstname: original[i].firstname,
          lastname: original[i].lastname,
          email: original[i].email,
          phone: (original[i].phone === "" || original[i].phone === null ? null : original[i].phone)
        })
      }
      return newJson;

    } catch (error) {
      console.log(error.message)
    }
  }

  async function uploadToDb() {
    try {
      if (data.length === 0) {
        alert("Please select a file to import before uploading.");
      } else if (roles === undefined) {
        alert("Please select a role for the importing accounts.");
      } else {
        // console.log("test");
        let toSend = prepereToSend(data)
        axiosJWT.post(`http://localhost:${process.env.REACT_APP_PORT || 5000}/account/import`, {
          file: toSend,
          roles: "referee"
        }, {
          headers: {
            authorization: `${sessionStorage.getItem("accessToken")}`
          }
        }).then((res) => {
          console.log(res.data);
        })   
        // console.log(toSend);
      } 
    } catch (error) {
      console.log(error.message)
    }
  }

  function changeData(index, key, value) {
    let newData = [...data];
    newData[index][key] = value;
    setData(newData);
    console.log(newData);
  }

  return (
    <>
      <h1>Excel to Json Converter</h1>
      <input
        type="text"
        value={keyValueName.firstname}
        name="firstname"
        placeholder="firstname"
        onChange={(e) => handleInputChange(e)}
      />
      <input
        type="text"
        value={keyValueName.lastname}
        name="lastname"
        placeholder="lastname"
        onChange={(e) => handleInputChange(e)}
      />
      <input
        type="text"
        value={keyValueName.email}
        name="email"
        placeholder="email"
        onChange={(e) => handleInputChange(e)}
      />
      <input
        type="text"
        value={keyValueName.phone}
        name="phone"
        placeholder="phone"
        onChange={(e) => handleInputChange(e)}
      />
      <br />
      <input
        type="file"
        accept=".xls,.xlsx"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={handleConvert}>Convert</button>
      {/* <br /> */}
      <select defaultValue="default" onChange={(e) => setRoles(e.target.value)}>
        <option value="default" disabled>Select a role for the importing accounts.</option>
        <option value="referee">Referee</option>
        <option value="coach">Coach</option>
        <option value="admin">Admin</option>
      </select>
      <button onClick={uploadToDb}>upload into db</button>
      {/* <pre>{jsonData}</pre> */}
      {data.map((person, index) => (
        <table key={index}>
          <tbody>
            {/* <p>{index}</p>
            <p>{person.firstname}</p>
            <p>{person.lastname}</p>
            <p>{person.email}</p> */}
            <SingleAccount
              index={index}
              firstname={person.firstname}
              lastname={person.lastname}
              email={person.email}
              phone={person.phone}
              changeData={changeData}
            />
          </tbody>
        </table>
      ))}
    </>
  );
}

export default ExcelToJsonConverter;