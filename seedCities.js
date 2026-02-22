const { MongoClient } = require("mongodb");
const dns = require("dns");
require("dotenv").config();

// DNS Fix
dns.setServers(["8.8.8.8", "8.8.4.4"]);
dns.setDefaultResultOrder("ipv4first");

const cities = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara",
  "Antalya", "Artvin", "Aydın", "Balıkesir", "Bilecik", "Bingöl",
  "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı",
  "Çorum", "Denizli", "Diyarbakır", "Edirne", "Elazığ", "Erzincan",
  "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane",
  "Hakkari", "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir",
  "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir",
  "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa",
  "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir",
  "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt",
  "Sinop", "Sivas", "Tekirdağ", "Tokat", "Trabzon", "Tunceli",
  "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak",
  "Aksaray", "Bayburt", "Karaman", "Kırıkkale", "Batman",
  "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova",
  "Karabük", "Kilis", "Osmaniye", "Düzce"
];

function randomBetween(min, max) {
  return +(Math.random() * (max - min) + min).toFixed(4);
}

function generateProducts() {
  return {
    has: { alis: randomBetween(0.99, 1.01), satis: randomBetween(0.99, 1.01) },
    gram24: { alis: randomBetween(0.99, 1.01), satis: randomBetween(0.99, 1.01) },
    gram22: { alis: randomBetween(0.988, 1.012), satis: randomBetween(0.988, 1.012) },
    ceyrek: { alis: randomBetween(0.985, 1.015), satis: randomBetween(0.985, 1.015) },
    yarim: { alis: randomBetween(0.985, 1.015), satis: randomBetween(0.985, 1.015) },
    tam: { alis: randomBetween(0.985, 1.015), satis: randomBetween(0.985, 1.015) }
  };
}

async function seed() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection("cities");

    console.log("Bağlanılan DB:", db.databaseName);
    console.log("Mevcut şehirler temizleniyor...");
    await collection.deleteMany({});

    const docs = cities.map(name => ({
      city: name,
      products: generateProducts()
    }));

    await collection.insertMany(docs);
    console.log("81 il başarıyla eklendi ✅");

    const count = await collection.countDocuments();
    console.log("Toplam şehir sayısı:", count);

  } catch (err) {
    console.error("SEED HATA:", err);
  } finally {
    await client.close();
  }
}

seed();