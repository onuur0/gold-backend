const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const Price = require("./models/Price");
const City = require("./models/City");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to Database
connectDB();

// 🔥 SECURITY & MIDDLEWARE
app.use(helmet()); // Basic security headers
app.use(cors());
app.use(express.json());

// API Rate Limiting: 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: "Too many requests from this IP, please try again later." }
});

// Apply limiter to all API routes
app.use("/api/", limiter);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Root route for testing
app.get("/", (req, res) => {
  res.json({
    success: true,
    status: "ok",
    message: "Gold API is running 🚀",
    timestamp: new Date().toISOString()
  });
});

// 🔥 HESAPLAMA FONKSİYONU
function calculatePrices(base, products) {
  const gram24_base_alis = Number(base.alis);
  const gram24_base_satis = Number(base.satis);

  const gram22_base_alis = gram24_base_alis * 0.916;
  const gram22_base_satis = gram24_base_satis * 0.916;

  const ceyrek_katsayi = gram22_base_alis * 1.75;
  const ceyrek_katsayi_satis = gram22_base_satis * 1.75;

  const round = (val, ratio) => Math.round(val * ratio);

  return {
    has: {
      alis: round(gram24_base_alis, products.has.alis),
      satis: round(gram24_base_satis, products.has.satis)
    },
    gram24: {
      alis: round(gram24_base_alis, products.gram24.alis),
      satis: round(gram24_base_satis, products.gram24.satis)
    },
    gram22: {
      alis: round(gram22_base_alis, products.gram22.alis),
      satis: round(gram22_base_satis, products.gram22.satis)
    },
    ceyrek: {
      alis: round(ceyrek_katsayi, products.ceyrek.alis),
      satis: round(ceyrek_katsayi_satis, products.ceyrek.satis)
    },
    yarim: {
      alis: round(ceyrek_katsayi * 2, products.yarim.alis),
      satis: round(ceyrek_katsayi_satis * 2, products.yarim.satis)
    },
    tam: {
      alis: round(ceyrek_katsayi * 4, products.tam.alis),
      satis: round(ceyrek_katsayi_satis * 4, products.tam.satis)
    },
    lastUpdate: base.createdAt
  };
}

// 🌍 GENEL KURLAR ROUTE
app.get("/api/rates", async (req, res) => {
  try {
    const harem = await Price.findOne({ type: "harem" }).sort({ createdAt: -1 });
    const dolar = await Price.findOne({ type: "dolar" }).sort({ createdAt: -1 });
    const euro = await Price.findOne({ type: "euro" }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        has: harem ? Number(harem.satis) : 0,
        dolar: dolar ? Number(dolar.satis) : 0,
        euro: euro ? Number(euro.satis) : 0,
        ons: 0, // Ons veri kaynağında eksik olduğu için geçici olarak 0
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error("HATA:", err.message);
    res.status(500).json({ success: false, error: "Sunucu hatası" });
  }
});

// 🔥 GÜNCEL FİYAT ROUTE
app.get("/api/:city", async (req, res) => {
  try {
    const cityName = req.params.city;

    const base = await Price.findOne({ type: "harem" }).sort({ createdAt: -1 });

    if (!base) {
      return res.status(404).json({ success: false, error: "Baz fiyat bulunamadı" });
    }

    const city = await City.findOne({ city: { $regex: new RegExp(`^${cityName}$`, "i") } });

    if (!city) {
      return res.status(404).json({ success: false, error: `${cityName} bulunamadı` });
    }

    const result = calculatePrices(base, city.products);
    res.json({ success: true, data: result });

  } catch (err) {
    console.error("HATA:", err.message);
    res.status(500).json({ success: false, error: "Sunucu hatası" });
  }
});

// 📈 GEÇMİŞ FİYAT ROUTE (Grafik için)
app.get("/api/:city/history", async (req, res) => {
  try {
    const cityName = req.params.city;
    const days = parseInt(req.query.days) || 7; // Varsayılan 7 gün

    const city = await City.findOne({ city: { $regex: new RegExp(`^${cityName}$`, "i") } });

    if (!city) {
      return res.status(404).json({ success: false, error: `${cityName} bulunamadı` });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const historicalBases = await Price.find({
      type: "harem",
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 }); // Eskiden yeniye

    const history = historicalBases.map(base => calculatePrices(base, city.products));

    res.json({ success: true, data: history });

  } catch (err) {
    console.error("HATA:", err.message);
    res.status(500).json({ success: false, error: "Sunucu hatası" });
  }
});

app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda 🚀`);
});
