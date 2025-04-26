
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/analyze', async (req, res) => {
    const { companyName, sector, turnover, employees, profitability, debtLevel, exportStatus, innovationStatus } = req.body;

    try {
        const prompt = `
Şu şirket bilgilerini analiz et:
- Şirket Adı: ${companyName}
- Sektör: ${sector}
- Ciro: ${turnover} ₺
- Çalışan Sayısı: ${employees}
- Karlılık: ${profitability}%
- Borç Seviyesi: ${debtLevel}
- İhracat: ${exportStatus}
- Yenilikçilik Yatırımı: ${innovationStatus}

Bu şirket için:
- 0-100 arası bir Sürdürülebilirlik Skoru ver.
- Bir cümlelik kısa analiz yaz.
- Güçlü Yanlar
- Zayıf Noktalar
- Riskler
- Fırsatlar
- Tavsiyeler
Şeklinde detaylı bir analiz oluştur.
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
