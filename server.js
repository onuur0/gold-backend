const axios = require("axios");
const connectDB = require("./config/db");
const Price = require("./models/Price");
require("dotenv").config();

// Connect to Database
connectDB();

async function fetchAndSave() {
  try {
    console.log("API'ye bağlanıyorum...");

    const response = await axios.get("https://altinapp.tamergunes.net/api/Service");
    const data = response.data[0];

    if (!data) {
      console.log("API'den veri alınamadı ❌");
      return;
    }

    const harem_alis = data.harem_alis;
    const harem_satis = data.harem_satis;
    const dolar_alis = data.dolar_alis;
    const dolar_satis = data.dolar_satis;
    const euro_alis = data.euro_alis;
    const euro_satis = data.euro_satis;

    console.log("Harem:", harem_alis, harem_satis);
    console.log("USD:", dolar_alis, dolar_satis);
    console.log("EUR:", euro_alis, euro_satis);

    // Helper to save if changed
    async function saveIfChanged(type, alis, satis) {
      const last = await Price.findOne({ type }).sort({ createdAt: -1 });
      if (!last || last.alis !== alis || last.satis !== satis) {
        await Price.create({ type, alis, satis, createdAt: new Date() });
        console.log(`Yeni ${type} verisi kaydedildi ✅`);
      }
    }

    await saveIfChanged("harem", harem_alis, harem_satis);
    await saveIfChanged("dolar", dolar_alis, dolar_satis);
    await saveIfChanged("euro", euro_alis, euro_satis);

  } catch (err) {
    console.error("HATA:", err.message);
  }
}

// İlk çalıştırma
fetchAndSave();

// 1 dakikada bir tekrar çalıştır
setInterval(fetchAndSave, 60 * 1000);
