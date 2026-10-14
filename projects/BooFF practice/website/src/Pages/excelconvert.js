import React, { useState } from "react";
import * as XLSX from "xlsx";
import { CSVLink, CSVDownload } from "react-csv";



function ExcelToJsonConverter() {
  const [file, setFile] = useState(null);
  const [jsonData, setJsonData] = useState("");

  const csvData = [
    ["firstname", "lastname", "email"],
    ["Ahmed", "Tomi", "ah@smthing.co.com"],
    ["Raed", "Labes", "rl@smthing.co.com"],
    ["Yezzi", "Min l3b", "ymin@cocococo.com"],
  ];

  const data = [
    { firstname: "Ahmed", lastname: "Tomi", email: "ah@smthing.co.com" },
    { firstname: "Raed", lastname: "Labes", email: "rl@smthing.co.com" },
    { firstname: "Yezzi", lastname: "Min l3b", email: "ymin@cocococo.com" },
  ];

  const handleConvert = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        setJsonData(JSON.stringify(json, null, 2));
      };
      reader.readAsBinaryString(file);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".xls,.xlsx"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={handleConvert}>Convert</button>
      <pre>{jsonData}</pre>
      <CSVLink data={csvData} separator={";"}>Download me</CSVLink> 
      {/* <CSVDownload data={csvData} target="_blank" />  */}
      {/* <button onClick={<CSVDownload data={csvData} target="_blank" />} >Download</button> */}
    </div>
  );
}

export default ExcelToJsonConverter;