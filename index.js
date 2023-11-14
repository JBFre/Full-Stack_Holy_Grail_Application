const express = require("express");
const { createClient } = require('redis');
const app = express();
const client = createClient();

//TODO: create a redis client
client.on('error', (err) => console.log('Redis Client Error', err));
client.connect();

// serve static files from public directory
app.use(express.static("public"));

async function fetchData() {
  try {
    // TODO: initialize values for: header, left, right, article and footer using the redis client
    const values = await client.mGet(["header", "left", "article", "right", "footer"]);
    return {
      header: Number(values[0]),
      left: Number(values[1]),
      article: Number(values[2]),
      right: Number(values[3]),
      footer: Number(values[4]),
    };
  } catch (err) {
    console.error("Error in fetchData function:", err);
    throw err;
  }
}

app.get("/data", async function (req, res) {
  try {
    const data = await fetchData();
    res.send(data);
  } catch (err) {
    console.error("Error retrieving data:", err);
    res.status(500).send("Error retrieving data");
  }
});

// get key data
app.get("/update/:key/:value", async function (req, res) {
  const key = req.params.key;
  const value = Number(req.params.value);

  try {
    await client.set(key, value);
    const updatedData = await fetchData();
    res.send(updatedData);
  } catch (err) {
    console.error("Error updating value in Redis:", err);
    res.status(500).send("Error updating value");
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

process.on("exit", () => {
  client.quit();
});
