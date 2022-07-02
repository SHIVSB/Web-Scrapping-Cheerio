const express = require("express");
const app = express();
const fs = require("fs");
const axios = require("axios");
const pdf = require("html-pdf");
const cheerio = require("cheerio");
const htm = fs.readFileSync("index.html", "utf8");
let page = cheerio.load(htm);
const logger = require("morgan");
const PORT = 4000;

app.use(logger("dev"));


app.get("/", function (req, res) {
  return res.send("Hey Shiv, web scrapping server working perfectly");
});

app.get("/check", async function (req, res) {
  let stock = ["Infosys", "TataSteel"];
  let url = [
    "https://www.business-standard.com/company/infosys-2806.html",
    "https://www.business-standard.com/company/tata-steel-566.html",
  ];

  page = cheerio.load(htm);

  for (let u = 0; u < url.length; u++) {
    try {
      let response = await axios(url[u]);
      let html = response.data;
      let $ = cheerio.load(html);

      let values = [];
      $(".tdC").filter(function () {
        let data = $(this);
        values.push(parseFloat(data.text()));
      });

      page(".my_table").append(
        `<tr>
        <td>${stock[u]}</td>
        <td>${values[2]}</td>
        <td>${values[0]}</td>
        <td>${Math.abs(values[2] - values[0])}</td>
        </tr>`
      );
      console.log(`${stock[u]} values = `, values);
    } catch (error) {
      console.log(error);
    }
  }
  return res.send("Data fetched successfully");
});

app.get("/download", function (req, res) {
  try {
    let options = { format: "A4", orientation: "portrait", border: "10mm" };
    pdf
      .create(page.html(), options)
      .toFile("./output.pdf", function (err, resp) {
        if (err) return console.log(err);
        res.download(resp.filename);
      });
  } catch (error) {
    console.log(error);
  }
});

app.listen(PORT, function (error) {
  if (error) {
    console.log("Error in starting server");
  }

  console.log(`Server started successfully : ${PORT}`);
});
