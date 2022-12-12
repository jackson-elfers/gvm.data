const path = require("path");
const fs = require("fs");
const axios = require("axios");

async function downloadFile(data) {  
  const url = `https://www.giocars.com/files/read/storage/${data.storage_name}`
  const pathway = path.resolve(__dirname, 'images', data.storage_name)
  const writer = fs.createWriteStream(pathway)

  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  })

  response.data.pipe(writer)

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
}

async function getMedia(data) {
  return (await axios.get(`https://www.giocars.com/files/read/owner/${data.parent_id}`)).data.data;
}

async function migrate() {
  const response = await axios.get("https://www.giocars.com/inventory/select/null/null/null/null/0/1000");
  //console.log(response.data.data);
  var temp = [];
  for (var i = 0; i < response.data.data.length; ++i) {
    console.log(`entry ${i}`)
    const media = await getMedia({ parent_id: response.data.data[i]._id });
    temp.push(media);
    // download images
    for(var c = 0; c < media.length; ++c) {
      console.log(`image ${c}`);
      await downloadFile(media[c]);
    }
  }
  fs.writeFile('gvm.image.data.json', JSON.stringify(temp), function (err) {
    if (err) throw err;
    console.log('Saved!');
  });

  fs.writeFile('gvm.content.data.json', JSON.stringify(response.data.data), function (err) {
    if (err) throw err;
    console.log('Saved!');
  });
}

migrate().catch(error => {
console.log(error);
});
