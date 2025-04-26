
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: 'https://reklamingo-surdurulebilirlik-skoru.onrender.com', 
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
};

app.use(cors(corsOptions));

app.use(express.json());

app.post('/analyze', async (req, res) => {
    const {
        companyName,
        turnover,
        grossProfitMargin,
        debtRatio,
        debtMaturity,
        rentExpense,
        personnelExpense,
        taxExpense,
        otherExpense,
        sector,
        newProject
    } = req.body;

    try {
        const prompt = `
Şu şirket bilgilerini analiz et:
- Şirket Adı: ${companyName}
- Yıllık Ciro: ${turnover} ₺
- Brüt Karlılık Oranı: ${grossProfitMargin}%
- Borç/Ciro Oranı: ${debtRatio}%
- Borçların Ortalama Vadesi: ${debtMaturity}
- Aylık Kira Gideri: ${rentExpense} ₺
- Aylık Personel Gideri: ${personnelExpense} ₺
- Aylık Vergi Gideri: ${taxExpense} ₺
- Aylık Diğer İşletme Giderleri: ${otherExpense} ₺
- Sektör: ${sector}
- En Yeni Proje: ${newProject}

Bu bilgiler ışığında:
1. Şirketin genel sürdürülebilirlik skorunu 0-100 arası puanla.
2. Skorun hemen altında bir cümlelik genel bir kısa analiz yaz.
3. Ardından şunları ayrı ayrı bölümlerde yaz:
   - Güçlü Yanlar
   - Zayıf Noktalar
   - Mevcut Riskler
   - Fırsatlar
   - Tavsiyeler
4. En yeni proje hakkında ayrıca yorum yap:
   - Bu proje şirketin sürdürülebilirlik skoruna pozitif mi, negatif mi etkisi olur? Neden?
Lütfen yanıtını sıralı, açık ve nitelikli yaz.
        `;

        const openaiRes = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7
        }, {
            headers: {
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            }
        });

        const aiContent = openaiRes.data.choices[0].message.content;
        res.json({ success: true, result: aiContent });

    } catch (error) {
        console.error(error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, message: 'API hatası' });
    }
});

app.listen(PORT, () => {
    console.log(`Server çalışıyor: ${PORT}`);
});
