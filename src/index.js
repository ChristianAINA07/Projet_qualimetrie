const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());

// 👉 ITO no tena zava-dehibe
app.use(express.static(path.join(__dirname, '../public')));

const kpiRoutes = require('./routes/kpi');
app.use('/api', kpiRoutes);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});