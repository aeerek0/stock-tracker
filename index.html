// --- ตัวแปร Global ---
let dividendData = {};
let allocationChart = null;
let WEB_APP_URL = "";
let globalTradesData = [];
let displayCount = 20;
let currentMonitorView = 'stock';
let sortDirection = 1;
let portfolio = {};
let sectorPortfolio = {};
let realizedPnL = {};
let unrealizedPnL = {};
let sectorPnL = {};
let sectorUnrealizedPnL = {};
let currentPrices = {};
let totalDividend = 0;
let dividendHistoryLimit = 10;
let showAllDividend = false;
let dividendCostBasis = {};
let dividendMonthlyChart = null;
let dividendStockChart = null;
let dividendYearChart = null;
let chartFilter = "all";   // all | top10
let currentAlerts = [];


// --- ฟังก์ชัน initConnection ที่ปรับปรุงให้เหมือนเวอร์ชันล่าสุด ---
function initConnection() {
    const savedUrl = localStorage.getItem('user_google_sheet_url');
    const statusEl = document.getElementById('connectionStatus');
    const inputEl = document.getElementById('sheetUrlInput');

    if (savedUrl) {
        WEB_APP_URL = savedUrl;

        if (inputEl) {
            inputEl.value = savedUrl;
        }

        // แสดงสถานะกำลังเชื่อม
        if (statusEl) {
            statusEl.innerHTML = "🟡 สถานะ: กำลังเชื่อมต่อ...";
            statusEl.className = "d-block mt-2 fw-bold text-warning";
        }

        // โหลดรายชื่อหุ้น
      if (typeof buildStockDropdown === 'function') {
    buildStockDropdown();
          
}

if (typeof buildBrokerDropdown === 'function') {
    buildBrokerDropdown();
    updateSubmitButton(false);
}
        // ทดสอบ Connection
        fetch(WEB_APP_URL)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Connection Error");
                }
                return response.json();
            })
.then(data => {
    globalTradesData = data.trades;
    window.currentPrices = data.prices;

    if (statusEl) {
        statusEl.innerHTML = "🟢 สถานะ: เชื่อมต่อ Google Sheet สำเร็จ (" + data.trades.length + " รายการ)";
        statusEl.className = "d-block mt-2 fw-bold text-success";
    }

    renderPortfolioAndRecords(globalTradesData);

const alerts = generatePortfolioAlerts();

renderAlertSummary(alerts);
})
            .catch(error => {
                console.error(error);
                if (statusEl) {
                    statusEl.innerHTML = "🔴 สถานะ: เชื่อมต่อไม่สำเร็จ";
                    statusEl.className = "d-block mt-2 fw-bold text-danger";
                }
            });
    } else {
        if (statusEl) {
            statusEl.innerHTML = "🔴 สถานะ: ยังไม่ได้เชื่อมต่อ";
            statusEl.className = "d-block mt-2 fw-bold text-muted";
        }
    }
}

window.saveSheetUrl = function() {
    const urlInput = document.getElementById('sheetUrlInput');
    const url = urlInput.value.trim();

    if(url === "") {
        alert("กรุณาใส่ Web App URL");
        return;
    }

    localStorage.setItem('user_google_sheet_url', url);
    WEB_APP_URL = url;
    initConnection();
};

const typeElement = document.getElementById('type');

if (typeElement) {

    typeElement.addEventListener('change', function () {

        const type = this.value;

        const amountContainer = document.getElementById('amountContainer');
        const symbolGroup = document.getElementById('symbol').parentElement;
        const sectorGroup = document.getElementById('sector').parentElement;
        const brokerGroup = document.getElementById('broker').parentElement;
        const priceGroup = document.getElementById('price').parentElement;
        const unitsGroup = document.getElementById('units').parentElement;

        // ⭐ เปลี่ยนจาก feeRate เป็น fee + vat
        const feeGroup = document.getElementById('fee').parentElement;
        const vatGroup = document.getElementById('vat').parentElement;

        const xdDateContainer = document.getElementById('xdDateContainer');

        // -----------------------------
        // ค่าเริ่มต้น: แสดงทุกอย่าง
        // -----------------------------

        symbolGroup.style.display = "";
        sectorGroup.style.display = "";
        brokerGroup.style.display = "";
        priceGroup.style.display = "";
        unitsGroup.style.display = "";

        feeGroup.style.display = "";
        vatGroup.style.display = "";

        amountContainer.style.display = "none";
        xdDateContainer.style.display = "none";


        // -----------------------------
        // ฝากเงิน / ถอนเงิน
        // -----------------------------

        if (type === "ฝากเงิน" || type === "ถอนเงิน") {

            amountContainer.style.display = "block";

            symbolGroup.style.display = "none";
            sectorGroup.style.display = "none";
            brokerGroup.style.display = "none";
            priceGroup.style.display = "none";
            unitsGroup.style.display = "none";

            feeGroup.style.display = "none";
            vatGroup.style.display = "none";
        }


        // -----------------------------
        // ปันผล
        // -----------------------------

        if (type === "ปันผล") {

            amountContainer.style.display = "block";
            xdDateContainer.style.display = "block";

            // ปันผลใช้
            // Symbol + Sector + Broker
            // Price(DPU) + Units

            symbolGroup.style.display = "";
            sectorGroup.style.display = "";
            brokerGroup.style.display = "";

            priceGroup.style.display = "";
            unitsGroup.style.display = "";

            // ไม่ใช้ค่าธรรมเนียม
            feeGroup.style.display = "none";
            vatGroup.style.display = "none";
        }

    });

    // ⭐ ให้ทำงานทันทีตอนเปิดหน้า
    typeElement.dispatchEvent(new Event('change'));
}
const masterSectorMap = {
    "BA": "Transport", "BCH": "Health Care", "BDMS": "Health Care", "BGRIM": "Energy",
    "CENTEL": "Tourism", "CPALL": "Commerce", "CPN": "Property", "EPG": "Property & Construction",
    "EA": "Energy", "HMPRO": "Commerce", "LH": "Property", "MC": "Fashion", "MINT": "Tourism",
    "SABINA": "Fashion", "SAT": "Automotive", "SPALI": "Property", "TIPH": "Insurance",
    "TISCO": "Banking", "TLI": "Insurance", "TU": "Food & Bev", "WHA": "Property (Indus)","TRUE": "Telecommunications"
};

const masterBrokerList = [
    "Finansia",
    "Yuanta",
    "Pi"
];

let dynamicSectorMap = {}; 

// --- 7. ฟังก์ชันเสริม ---
function buildStockDropdown() {
    const datalist = document.getElementById('stockOptions');
    if (datalist) {
        datalist.innerHTML = '';
        Object.keys(masterSectorMap).forEach(stock => {
            const option = document.createElement('option');
            option.value = stock;
            datalist.appendChild(option);
        });
    }
}

function buildBrokerDropdown() {

    const datalist = document.getElementById('brokerOptions');

    if (datalist) {

        datalist.innerHTML = '';

        masterBrokerList.forEach(broker => {

            const option = document.createElement('option');

            option.value = broker;

            datalist.appendChild(option);

        });

    }
}

function buildDynamicSectorMap(){

    dynamicSectorMap = {};

    if(!globalTradesData) return;


    globalTradesData.forEach(t=>{

        const symbol = String(t.symbol || "")
            .trim()
            .toUpperCase();

        const sector = t.sector;


        if(symbol && sector){

            dynamicSectorMap[symbol] = sector;

        }

    });

}

function getSectorBySymbol(symbol){

    symbol = String(symbol || "")
        .trim()
        .toUpperCase();

    // 1. ค้นจากประวัติซื้อขาย
    const trade = globalTradesData.find(t =>
        String(t.symbol).trim().toUpperCase() === symbol &&
        t.sector
    );

    if (trade) {
        return trade.sector;
    }

    // 2. ถ้าไม่มี ค่อยใช้ Master
    if (masterSectorMap[symbol]) {
        return masterSectorMap[symbol];
    }

    return "";
}

function updateMonitor(view) {
    currentMonitorView = view;
    const dataMap = (view === 'stock') ? portfolio : sectorPortfolio;
    const pnLMap = (view === 'stock') ? realizedPnL : sectorPnL;

    renderMonitorTable(dataMap, pnLMap);
    drawAllocationChart(view);
}

function sortMonitorBy() {
    const dataMap = currentMonitorView === "stock" ? portfolio : sectorPortfolio;
    const pnLMap = currentMonitorView === "stock" ? realizedPnL : sectorPnL;

    const sorted = Object.keys(dataMap)
        .filter(k => dataMap[k].totalUnits > 0)
        .sort((a,b) => {
            const roiA = dataMap[a].totalCost === 0 ? 0 : pnLMap[a] / dataMap[a].totalCost;
            const roiB = dataMap[b].totalCost === 0 ? 0 : pnLMap[b] / dataMap[b].totalCost;
            return (roiA - roiB) * sortDirection;
        });

    sortDirection *= -1;
    renderMonitorTable(dataMap, pnLMap, sorted);
}
function autoFillSector(symbolValue) {

    if (!symbolValue) return;

    const sym = String(symbolValue)
        .trim()
        .toUpperCase();

    document.getElementById('symbol').value = sym;

    const sectorInput = document.getElementById('sector');
    if (!sectorInput) return;

    // 1. ค้นหาจากประวัติซื้อขายก่อน
    const trade = globalTradesData.find(t =>
        String(t.symbol).trim().toUpperCase() === sym &&
        t.sector
    );

    if (trade) {
        sectorInput.value = trade.sector;
        return;
    }

    // 2. ถ้าไม่มีในประวัติ ค่อยใช้ Master
    if (masterSectorMap[sym]) {
        sectorInput.value = masterSectorMap[sym];
        return;
    }

    // 3. ไม่เจอ
    sectorInput.value = "";

}
function fetchAndRenderData() {
       console.log("เริ่ม Refresh");
    

    if (!WEB_APP_URL) {
        alert(WEB_APP_URL);
        return;
    }


    document.getElementById('monitorTableBody').innerHTML = `<tr><td colspan="7">กำลังโหลดพอร์ตของคุณ...</td></tr>`;
    document.getElementById('tradeTableBody').innerHTML = `<tr><td colspan="12">กำลังโหลดประวัติ...</td></tr>`;

    fetch(WEB_APP_URL)
        .then(response => response.json())
        .then(data => {
            console.log("Refresh Data:", data);
            globalTradesData = (data.trades || []).map(t => {

    if (t.date instanceof Date) {
        t.date =
            t.date.getFullYear() + "-" +
            String(t.date.getMonth()+1).padStart(2,"0") + "-" +
            String(t.date.getDate()).padStart(2,"0");
    }

    if (typeof t.date === "string" && t.date.includes("T")) {
        t.date = t.date.substring(0,10);
    }

    return t;

});
            window.currentPrices = data.prices || {};
            dynamicSectorMap = {};

            globalTradesData.forEach(t => {
                if (t.symbol && t.sector) {
                    dynamicSectorMap[t.symbol.trim().toUpperCase()] = t.sector;
                }
            });

renderPortfolioAndRecords(globalTradesData);

buildDividendYear();
buildCalendarYear();
renderDividendHistory();


        })
        .catch(error => {
            console.error("Refresh Error:", error);
            document.getElementById('monitorTableBody').innerHTML = `<tr><td colspan="5" class="text-danger">โหลดข้อมูลล้มเหลว</td></tr>`;
            document.getElementById('tradeTableBody').innerHTML = `<tr><td colspan="12" class="text-danger">โหลดข้อมูลล้มเหลว</td></tr>`;
        });
}


// ✏️ ฟังก์ชันดึงค่าเข้าสู่โหมดแก้ไขข้อมูล 
function startEditMode(rowIndex) {

    const trade = globalTradesData.find(t => t.rowIndex == rowIndex);
    if (!trade) return;

    let dateVal = String(trade.date || "");

    if (dateVal.includes("T")) {
        dateVal = dateVal.split("T")[0];
    }

    document.getElementById('editRowIndex').value = trade.rowIndex;
    document.getElementById('date').value = dateVal;

    document.getElementById('type').value = trade.type;

    document.getElementById('symbol').value = trade.symbol;
    document.getElementById('sector').value = trade.sector || '';
    document.getElementById('broker').value = trade.broker || '';

    document.getElementById('xdDate').value = trade.xdDate || '';
    document.getElementById('remark').value = trade.remark || '';

    document.getElementById('price').value = trade.price;
    document.getElementById('units').value = trade.units;
    const feeTax = Number(trade.feeTax || 0);

const fee = feeTax / 1.07;
const vat = feeTax - fee;

document.getElementById('fee').value = fee.toFixed(2);
document.getElementById('vat').value = vat.toFixed(2);

    document.getElementById('amount').value = trade.netAmount || '';

    // จัด layout ตามประเภท
    document.getElementById('type')
        .dispatchEvent(new Event('change'));


    document.getElementById('formTitle').innerText = "✏️ แก้ไขข้อมูลรายการ";
    document.getElementById('editAlert').style.display = "block";


    // เปลี่ยนปุ่มเป็นโหมดแก้ไข
    updateSubmitButton(true);


    document.getElementById('tradeForm')
        .scrollIntoView({ behavior: 'smooth' });
}



function cancelEditMode() {

    document.getElementById('editRowIndex').value = "";

    document.getElementById('tradeForm').reset();


    // ค่าเริ่มต้น
    document.getElementById('type').value = "ซื้อ";
    document.getElementById('date').valueAsDate = new Date();
    document.getElementById('fee').value = "0.00";
document.getElementById('vat').value = "0.00";


    // ล้างค่าเพิ่มเติม
    document.getElementById('xdDate').value = "";
    document.getElementById('remark').value = "";
    document.getElementById('amount').value = "";


    // ปรับ layout
    document.getElementById('type')
        .dispatchEvent(new Event('change'));


    document.getElementById('formTitle').innerText = "➕ บันทึกรายการใหม่";
    document.getElementById('editAlert').style.display = "none";


    // กลับปุ่มเป็นโหมดเพิ่มรายการ
    updateSubmitButton(false);

}

function renderMonitorTable(dataMap, pnLMap, sortedKeys = null) {
    const mBody = document.getElementById('monitorTableBody');
    mBody.innerHTML = '';
    const header = document.getElementById('monitorSymbolHeader');

if (header) {
    header.innerText = currentMonitorView === "stock"
        ? "Symbol"
        : "Sector";
}
    let totalValue = 0;
    const keys = sortedKeys || Object.keys(dataMap);

    // คำนวณมูลค่าพอร์ตรวม
    keys.forEach(key => {
        const data = dataMap[key];
        if (!data || data.totalUnits <= 0) return;

        let marketPrice = data.avgPrice;
        let marketValue;

       if (currentMonitorView === "stock") {

    marketPrice = Number(window.currentPrices?.[key]) || data.avgPrice;
    marketValue = data.totalUnits * marketPrice;

} else {

    marketValue = 0;

    Object.keys(portfolio).forEach(sym => {

        const trade = globalTradesData.find(
            t => String(t.symbol).trim().toUpperCase() === sym
        );

        if (!trade) return;

        const sec = trade.sector || "อื่นๆ";

        if (sec === key) {

            const price =
                Number(window.currentPrices?.[sym]) ||
                portfolio[sym].avgPrice;

            marketValue += portfolio[sym].totalUnits * price;

        }

    });

}

        totalValue += marketValue;
    });

    // วาดตาราง
    keys.forEach(key => {
        const data = dataMap[key];
        if (!data || data.totalUnits <= 0) return;

        let marketPrice = data.avgPrice;
        let marketValue;

        if (currentMonitorView === "stock") {
            marketPrice = Number(window.currentPrices?.[key]) || data.avgPrice;
            marketValue = data.totalUnits * marketPrice;
        } else {

    marketPrice = 0;
    marketValue = 0;

    Object.keys(portfolio).forEach(sym => {

        const trade = globalTradesData.find(
            t => String(t.symbol).trim().toUpperCase() === sym
        );

        if (!trade) return;

        const sec = trade.sector || "อื่นๆ";

        if (sec === key) {

            const price =
                Number(window.currentPrices?.[sym]) ||
                portfolio[sym].avgPrice;

            marketValue += portfolio[sym].totalUnits * price;

        }

    });

}

let totalPnL;

if (currentMonitorView === "stock") {
    totalPnL = unrealizedPnL[key] || 0;
} else {
    totalPnL = sectorUnrealizedPnL[key] || 0;
}

        
        const roi = data.totalCost > 0 ? (totalPnL / data.totalCost) * 100 : 0;
        const weight = totalValue > 0 ? (marketValue / totalValue) * 100 : 0;
     // Dividend Yield
// Dividend Yield
let dividendReceived = 0;

if (currentMonitorView === "stock") {

    // กรณีดูรายหุ้น
    globalTradesData.forEach(trade => {

        if (
            trade.type === "ปันผล" &&
            String(trade.symbol).trim().toUpperCase() === key
        ) {
            dividendReceived += Number(trade.netAmount || 0);
        }

    });

} else {

    // กรณีดูราย Sector
    Object.keys(portfolio).forEach(sym => {

        const stockTrade = globalTradesData.find(
            t => String(t.symbol).trim().toUpperCase() === sym
        );

        if (!stockTrade) return;

        const stockSector = stockTrade.sector || "อื่นๆ";

        if (stockSector === key) {

            globalTradesData.forEach(trade => {

                if (
                    trade.type === "ปันผล" &&
                    String(trade.symbol).trim().toUpperCase() === sym
                ) {
                    dividendReceived += Number(trade.netAmount || 0);
                }

            });

        }

    });

}


const dividendYield = data.totalCost > 0
    ? (dividendReceived / data.totalCost) * 100
    : 0;
const totalReturn = totalPnL + dividendReceived;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="fw-bold">${key}</td>
            <td>${data.totalUnits.toLocaleString()}</td>
            <td>
${currentMonitorView === "stock"
    ? data.avgPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : "-"
}
</td>
            <td>${data.totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
            <td>
${currentMonitorView === "stock"
    ? marketPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : "-"
}
</td>
            <td>${marketValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
            <td class="text-secondary fw-bold">${weight.toFixed(1)}%</td>
            <td class="${totalPnL >= 0 ? 'text-success' : 'text-danger'}">${totalPnL.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
            <td class="${roi >= 0 ? 'text-success' : 'text-danger'}">${roi.toFixed(2)}%</td>
<td class="text-primary fw-bold">
${
    currentMonitorView === "sector" && dividendReceived === 0
    ? "-"
    : dividendYield.toFixed(2) + "%"
}
</td>

<td class="${totalReturn >= 0 ? 'text-success' : 'text-danger'} fw-bold">
${
    (totalReturn >= 0 ? "+" : "") +
    totalReturn.toLocaleString(undefined, {
        maximumFractionDigits: 2
    })
}
</td>
        `;
        mBody.appendChild(row);
    });
}

function renderPortfolioAndRecords(trades) {
    document.getElementById('searchInput').value = "";
    if (trades) {
        globalTradesData = trades;
    }

    buildDividendYear();
    
    // 1. ประกาศตัวแปรระดับ Local (ป้องกัน Global Scope Leak)
    portfolio = {};
    sectorPortfolio = {};
    realizedPnL = {};
    unrealizedPnL = {};
    sectorPnL = {};
    sectorUnrealizedPnL = {};
    dividendData = {};
    dividendCostBasis = {};
    sectorDividendData = {};

    // Map สำหรับเก็บข้อมูล Sector ของแต่ละหุ้นไว้ดึงข้อมูลง่ายๆ (O(1))
    const symbolSectorMap = {};
    
    const tbodyRecord = document.getElementById('tradeTableBody');
    tbodyRecord.innerHTML = '';

    let totalPortfolioValue = 0;
    let totalPnL = 0;
    let activeStocksCount = 0;
    let cashBalance = 0; // เงินสดคงเหลือจริงในพอร์ต
    let totalDividend = 0;

    // 2. เรียงลำดับรายการตามวันที่ (จากอดีตไปปัจจุบัน)
const sortedTrades = [...globalTradesData].sort((a, b) => {
    const dateA = String(a.date || "").substring(0, 10);
    const dateB = String(b.date || "").substring(0, 10);
    return dateA.localeCompare(dateB);
});

    // 3. ลูปประมวลผลการเทรดแบบ Single-Pass
    sortedTrades.forEach(trade => {
        const sym = String(trade.symbol || "").trim().toUpperCase();
        const sector = String(trade.sector || "อื่นๆ").trim();
        const amount = Number(trade.netAmount) || 0;
        const units = parseInt(trade.units) || 0;

        // บันทึก Sector ของหุ้นตัวนั้นๆ
        if (sym && sector && sector !== "อื่นๆ") {
            symbolSectorMap[sym] = sector;
        }

        // --- กรณี: ฝาก/ถอน เงิน ---
        if (trade.type === 'ฝากเงิน') {
            cashBalance += amount;
            return;
        }
        if (trade.type === 'ถอนเงิน') {
            cashBalance -= amount;
            return;
        }

        // --- กรณี: เงินปันผล ---
if (trade.type === 'ปันผล') {

    // ไม่เพิ่ม cash เพราะเงินจะเข้าเมื่อบันทึก "ฝากเงิน"
    totalDividend += amount;

            if (!dividendData[sym]) {
                dividendData[sym] = { count: 0, amount: 0, items: [], totalCost: 0 };
            }

            dividendData[sym].count++;
            dividendData[sym].amount += amount;

            const calcDate = trade.xdDate || trade.date;

const holdingAtXD = getHoldingAtDate(
    sym,
    calcDate
);

const costAtDividend = holdingAtXD.cost;
const unitsAtXD = holdingAtXD.units;
            dividendData[sym].totalCost += costAtDividend;

dividendData[sym].items.push({
    date: trade.date,
    xdDate: trade.xdDate || trade.date,

    amount: amount,
    dpu: Number(trade.price) || 0,

    units: unitsAtXD,

    costAtXD: costAtDividend,

    yield: costAtDividend > 0
        ? (amount / costAtDividend) * 100
        : 0
});

            // สะสมปันผลตาม Sector
            const symSector = symbolSectorMap[sym] || sector;
            sectorDividendData[symSector] = (sectorDividendData[symSector] || 0) + amount;
            return;
        }

        // --- กรณี: ซื้อ / ขาย หุ้น ---
        if (!portfolio[sym]) {
            portfolio[sym] = { totalUnits: 0, totalCost: 0, avgPrice: 0 };
            realizedPnL[sym] = 0;
        }
        
        if (!sectorPortfolio[sector]) {
            sectorPortfolio[sector] = { totalUnits: 0, totalCost: 0, avgPrice: 0 };
            sectorPnL[sector] = 0;
        }

        if (trade.type === 'ซื้อ') {
            cashBalance -= amount; // ซื้อหุ้น = เงินสดลดลง
            
            portfolio[sym].totalUnits += units;
            portfolio[sym].totalCost += amount;
            portfolio[sym].avgPrice = portfolio[sym].totalUnits > 0 ? portfolio[sym].totalCost / portfolio[sym].totalUnits : 0;

            dividendCostBasis[sym] = (dividendCostBasis[sym] || 0) + amount;

            sectorPortfolio[sector].totalUnits += units;
            sectorPortfolio[sector].totalCost += amount;
            sectorPortfolio[sector].avgPrice = sectorPortfolio[sector].totalUnits > 0 ? sectorPortfolio[sector].totalCost / sectorPortfolio[sector].totalUnits : 0;

        } else if (trade.type === 'ขาย') {
            cashBalance += amount; // ขายหุ้น = เงินสดเพิ่มขึ้น

            const costOfSoldShares = units * portfolio[sym].avgPrice;
            const sectorCostOfSold = units * sectorPortfolio[sector].avgPrice;

            realizedPnL[sym] += (amount - costOfSoldShares);
            sectorPnL[sector] += (amount - sectorCostOfSold);

            portfolio[sym].totalUnits -= units;
            portfolio[sym].totalCost -= costOfSoldShares;

            sectorPortfolio[sector].totalUnits -= units;
            sectorPortfolio[sector].totalCost -= sectorCostOfSold;
        }
    });

    // 4. คำนวณ Unrealized P/L (รายหุ้น และ ราย Sector)
    Object.keys(portfolio).forEach(sym => {
        if (portfolio[sym].totalUnits > 0) {
            const currentPrice = (window.currentPrices && window.currentPrices[sym]) ? Number(window.currentPrices[sym]) : portfolio[sym].avgPrice;
            const marketValue = portfolio[sym].totalUnits * currentPrice;
            const unPnL = marketValue - portfolio[sym].totalCost;

            unrealizedPnL[sym] = unPnL;
            
            // สะสม Unrealized P/L แยกตาม Sector
            const sec = symbolSectorMap[sym] || "อื่นๆ";
            sectorUnrealizedPnL[sec] = (sectorUnrealizedPnL[sec] || 0) + unPnL;

            // สรุป Dashboard
            activeStocksCount++;
            totalPortfolioValue += marketValue;
        }
        totalPnL += realizedPnL[sym] + (unrealizedPnL[sym] || 0);
    });

    // 5. อัปเดตข้อมูลบน Dashboard UI
    const totalUnrealized = Object.values(unrealizedPnL).reduce((sum, val) => sum + val, 0);
    const netWorth = totalPortfolioValue + cashBalance;
    // คำนวณต้นทุนหุ้นทั้งหมด
const totalCost = Object.values(portfolio)
    .reduce((sum, stock) => sum + stock.totalCost, 0);

// % Growth รวม
let growthPercent = 0;

if (totalCost > 0) {
    growthPercent = (totalPnL / totalCost) * 100;
}

    const setElementText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.innerText = text;
    };
// 1. ย้ายฟังก์ชันกำหนดสีขึ้นมาไว้นอกสุด เพื่อให้เรียกใช้ได้ตลอดเวลา
const setElementColor = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.style.color = val >= 0 ? "#4faba2" : "#e56b6f";
};

// 2. อัปเดตข้อความบน Dashboard
setElementText('dashTotalValue', totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2 }));
setElementText('dashTotalPnL', (totalPnL >= 0 ? '+' : '') + totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2 }));
//setElementText('dashGrowth', `Growth ${growthPercent >= 0 ? '+' : ''}${growthPercent.toFixed(2)}%`);
setElementText('dashUnrealizedPnL', (totalUnrealized >= 0 ? '+' : '') + totalUnrealized.toLocaleString(undefined, { minimumFractionDigits: 2 }));
setElementText('dashTotalStocks', activeStocksCount);
setElementText('dashDividend', totalDividend.toLocaleString(undefined, { minimumFractionDigits: 2 }));


localStorage.setItem("currentPortfolioValue", totalPortfolioValue);
localStorage.setItem("currentDividendValue", totalDividend);

// แจ้ง Goals ให้รีโหลดข้อมูล
const goalsFrame = document.querySelector("#goalsTab iframe");

if (goalsFrame && goalsFrame.contentWindow && typeof goalsFrame.contentWindow.loadGoals === "function") {
    goalsFrame.contentWindow.loadGoals();
}

// ==========================
// Total Return
// ==========================

const totalReturn = totalPnL + totalDividend;

// แสดงมูลค่า Total Return
setElementText(
    'totalReturn',
    (totalReturn >= 0 ? '+' : '') +
    totalReturn.toLocaleString(undefined, {
        minimumFractionDigits: 2
    })
);

// สี Total Return
const totalReturnElement = document.getElementById('totalReturn');

if (totalReturnElement) {

    totalReturnElement.style.color =
        totalReturn >= 0
            ? "#15803d"
            : "#dc2626";

}

// ==========================
// Total Return %
// ==========================

const totalReturnPercent =
    totalCost > 0
        ? (totalReturn / totalCost) * 100
        : 0;

const returnElement =
    document.getElementById('totalReturnPercent');

if (returnElement) {

    returnElement.innerHTML =
        (totalReturnPercent >= 0 ? '+' : '') +
        totalReturnPercent.toFixed(2) + '%';

    returnElement.style.color =
        totalReturnPercent >= 0
            ? "#15803d"
            : "#dc2626";

}
setElementText('dashCashBalance', cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 }));
setElementText('dashNetWorth', netWorth.toLocaleString(undefined, { minimumFractionDigits: 2 }));

// 3. ปรับสีข้อความตามค่าบวก/ลบ
setElementColor('dashGrowth', growthPercent);
setElementColor('dashTotalPnL', totalPnL);
setElementColor('dashUnrealizedPnL', totalUnrealized);

// 6. Render ตารางประวัติการเทรด (แสดงจากล่าสุดไปเก่าสุด)
    globalTradesData.slice(-displayCount).reverse().forEach(trade => {
        const gross = Number(trade.grossAmount) || 0;
        const fee = Number(trade.feeTax) || 0;
        const feeRate = gross > 0 ? (fee / gross) * 100 : 0;

        const isDepositOrWithdraw = (trade.type === 'ฝากเงิน' || trade.type === 'ถอนเงิน');
        const isExemptFee = ['ฝากเงิน', 'ถอนเงิน', 'ปันผล'].includes(trade.type);

        const row = document.createElement('tr');
row.innerHTML = `
    <td>${String(trade.date).substring(0,10)}</td>

    <td class="${trade.type === 'ซื้อ' ? 'type-buy' : trade.type === 'ขาย' ? 'type-sell' : ''}">
        ${trade.type}
    </td>

    <td class="fw-bold">
        ${trade.symbol || '-'}
        ${trade.xdDate ? ' 📅' : ''}
        ${trade.remark ? ' 📝' : ''}
        ${
            trade.remark
                ? `<br><small class="text-muted">${trade.remark}</small>`
                : ''
        }
    </td>

    <td>${trade.sector || '-'}</td>

    <td>${trade.broker || '-'}</td>

    <td>
        ${isDepositOrWithdraw ? '-' : Number(trade.price || 0).toLocaleString()}
    </td>

    <td>
        ${isDepositOrWithdraw ? '-' : Number(trade.units || 0).toLocaleString()}
    </td>

    <td>
        ${isDepositOrWithdraw ? '-' : Number(trade.grossAmount || 0).toLocaleString()}
    </td>

    <td>
        ${
            isExemptFee
                ? '-'
                : `${fee.toLocaleString(undefined,{
                    minimumFractionDigits:2,
                    maximumFractionDigits:2
                })}
                <br>
                <small class="text-muted">${feeRate.toFixed(4)}%</small>`
        }
    </td>

    <td class="fw-bold">
        ${Number(trade.netAmount || 0).toLocaleString()}
        ${
            trade.xdDate
                ? `<br><small class="text-primary">XD : ${trade.xdDate}</small>`
                : ''
        }
    </td>

    <td>
        <button class="btn-action-edit" onclick="startEditMode(${trade.rowIndex})">✏️</button>
        <button class="btn-delete" onclick="deleteRecord(${trade.rowIndex}, '${trade.symbol}', ${trade.units})">🗑️</button>
    </td>
`;
        tbodyRecord.appendChild(row);
    });

    if (displayCount < globalTradesData.length) {
        const loadMoreRow = document.createElement('tr');
        loadMoreRow.innerHTML = `<td colspan="11"><button class="btn w-100" onclick="loadMore()">ดูรายการก่อนหน้าเพิ่มเติม...</button></td>`;
        tbodyRecord.appendChild(loadMoreRow);
    }
    // 7. Render ตารางและกราฟอื่นๆ
    const dataMap = (currentMonitorView === 'stock') ? portfolio : sectorPortfolio;
    const pnLMap = (currentMonitorView === 'stock') ? realizedPnL : sectorPnL;

renderMonitorTable(dataMap, pnLMap);
drawAllocationChart(currentMonitorView);

renderDividendTable();
renderDividendHistory();
renderDividendKPI();
renderAlertSummary(generatePortfolioAlerts());
}

function loadMore() {
    displayCount += 20;
    renderPortfolioAndRecords();
}

function searchTrades() {
    const input = document.getElementById("searchInput").value.toUpperCase();
    
    // ถ้าช่องค้นหาว่าง ให้แสดงรายการปกติ (ตามจำนวน displayCount)
    if (input === "") {
        renderPortfolioAndRecords();
        return;
    }

    // ถ้ามีการพิมพ์ค้นหา ให้กรองข้อมูลทั้งหมด
    const filteredData = globalTradesData.filter(trade => {
        const dateStr = trade.date.split("T")[0]; // วันที่
        const sym = String(trade.symbol || "").toUpperCase(); // ชื่อหุ้น
        return sym.includes(input) || dateStr.includes(input);
    });

    // วาดตารางใหม่ด้วยผลลัพธ์ที่กรองแล้ว (แสดงทั้งหมดที่หาเจอ)
    renderTableOnly(filteredData);
}

// ฟังก์ชันพิเศษ: วาดแค่ตาราง โดยไม่คำนวณ Dashboard ซ้ำ
function renderTableOnly(data) {
    const tbodyRecord = document.getElementById('tradeTableBody');
    tbodyRecord.innerHTML = '';
    
    data.slice().reverse().forEach(trade => {

        const gross = Number(trade.grossAmount) || 0;
        const fee = Number(trade.feeTax) || 0;

        const feeRate = gross > 0
            ? (fee / gross) * 100
            : 0;

        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${trade.date.split("T")[0]}</td>
            <td class="${trade.type === 'ซื้อ' ? 'type-buy' : 'type-sell'}">${trade.type}</td>
            <td class="fw-bold">${trade.symbol}</td>
            <td>${trade.sector || '-'}</td>
            <td>${trade.broker || '-'}</td>
            <td>${parseFloat(trade.price).toLocaleString()}</td>
            <td>${parseInt(trade.units).toLocaleString()}</td>
            <td>${parseFloat(trade.grossAmount).toLocaleString()}</td>

            <td>
                ${fee.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}
                <br>
                <small class="text-muted">${feeRate.toFixed(4)}%</small>
            </td>

            <td class="fw-bold">${parseFloat(trade.netAmount).toLocaleString()}</td>
            <td>-</td>
            <td>
                <button class="btn-action-edit" onclick="startEditMode(${trade.rowIndex})">✏️</button>
                <button class="btn-delete" onclick="deleteRecord(${trade.rowIndex}, '${trade.symbol}', ${trade.units})">🗑️</button>
            </td>
        `;

        tbodyRecord.appendChild(row);
    });
}
function deleteRecord(rowIndex, symbol, units) {
    if (!confirm(`คุณต้องการลบรายการหุ้น ${symbol} จำนวน ${units.toLocaleString()} หุ้น ใช่หรือไม่?`)) {
        return;
    }

    document.getElementById('tradeTableBody').innerHTML = `<tr><td colspan="12" style="color:var(--pastel-sell); font-weight:bold;">⏳ กำลังลบข้อมูล...</td></tr>`;

    fetch(WEB_APP_URL, {
        method: "POST",
        cache: "no-cache",
        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify({
            action: "delete",
            rowIndex: rowIndex
        })
    })
    .then(r => r.json())
    .then(() => {
        alert("ลบข้อมูลสำเร็จ!");
        fetchAndRenderData();
    })
    .catch(err => {
        console.error(err);
        alert("ลบข้อมูลล้มเหลว");
    });
}
        
const tradeForm = document.getElementById('tradeForm');
if (tradeForm) {
    tradeForm.addEventListener('submit', function(e) {
        e.preventDefault();

        if (!WEB_APP_URL) {
            alert("ยังไม่ได้เชื่อม Google Sheet");
            return;
        }

        const submitBtn = document.getElementById('submitBtn');
        const editRowIndex = document.getElementById('editRowIndex').value;

        submitBtn.disabled = true;
        submitBtn.innerText = "⏳ กำลังบันทึกข้อมูล...";

        const price = parseFloat(document.getElementById('price').value) || 0;
        const units = parseInt(document.getElementById('units').value) || 0;
        const fee = parseFloat(document.getElementById('fee').value) || 0;
const vat = parseFloat(document.getElementById('vat').value) || 0;
const feeTax = fee + vat;
        const type = document.getElementById('type').value;

        const grossAmount = price * units;
        

        // แก้ไขตรงนี้: คำนวณ netAmount ให้จบในที่เดียว
        let netAmount = 0;
        if (type === 'ฝากเงิน' || type === 'ถอนเงิน') {
            netAmount = parseFloat(document.getElementById('amount').value) || 0;
        } else if (type === 'ปันผล') {
            netAmount = parseFloat(document.getElementById('amount').value) || 0;
        } else {
            netAmount = type === 'ซื้อ' ? grossAmount + feeTax : grossAmount - feeTax;
        }

        const isCash = type === 'ฝากเงิน' || type === 'ถอนเงิน';
        const isDividend = type === 'ปันผล';

const tradeData = {
    action: editRowIndex !== "" ? "edit" : "insert",
    rowIndex: editRowIndex,
    date: document.getElementById('date').value,
    type: type,
    symbol: document.getElementById('symbol').value.trim().toUpperCase(),
    sector: isCash ? 'Cash Management' : document.getElementById('sector').value,
    broker: document.getElementById('broker').value.trim(),
    xdDate: document.getElementById('xdDate').value,
    remark: document.getElementById('remark').value.trim(),

    // ซื้อ / ขาย / ปันผล เก็บราคาและจำนวนหุ้น
    price: (type === 'ซื้อ' || type === 'ขาย' || type === 'ปันผล') ? price : 0,

    units: (type === 'ซื้อ' || type === 'ขาย' || type === 'ปันผล') ? units : 0,

    // Gross ของปันผล = DPU x จำนวนหุ้น
    grossAmount: (type === 'ซื้อ' || type === 'ขาย' || type === 'ปันผล')
        ? grossAmount.toFixed(2)
        : 0,

    feeTax: (type === 'ซื้อ' || type === 'ขาย')
        ? feeTax.toFixed(2)
        : 0,

    netAmount: netAmount.toFixed(2)
};

        fetch(WEB_APP_URL, {
            method: "POST",
            cache: "no-cache",
            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },
            body: JSON.stringify(tradeData)
        })
        .then(response => response.json())
        .then(result => {
            console.log(result);
            if (result.status === "success") {
                alert(editRowIndex !== "" ? "อัปเดตข้อมูลสำเร็จ!" : "บันทึกข้อมูลสำเร็จ!");
                cancelEditMode();
                updateSubmitButton(false);
                fetchAndRenderData();
            } else {
                submitBtn.disabled = false;
                submitBtn.innerText = "💾 บันทึกส่งไปยัง Google Sheets";
                alert("เกิดข้อผิดพลาด");
            }
        })
        .catch(err => {
            console.error(err);
            submitBtn.disabled = false;
            submitBtn.innerText = "💾 บันทึกส่งไปยัง Google Sheets";
            alert("บันทึกข้อมูลไม่สำเร็จ");
        });
    });
}

function drawAllocationChart(view = "stock") {
    const dataMap = view === "stock" ? portfolio : sectorPortfolio;
    const labels = [];
    const values = [];

Object.keys(dataMap).forEach(key => {
    const item = dataMap[key];
    if (!item) return;

    // กรองเฉพาะ Stock
    if (view === "stock" && item.totalUnits <= 0) return;

        let value = 0;

        if (view === "stock") {
            // คำนวณมูลค่าตามรายหุ้น
            const price = Number(window.currentPrices && window.currentPrices[key]) || item.avgPrice;
            value = item.totalUnits * price;
        } else {
            // คำนวณมูลค่ารวมตาม Sector (ใช้มูลค่าตลาดปัจจุบันของหุ้นแต่ละตัวใน Sector นั้น)
            Object.keys(portfolio).forEach(sym => {
                const portfolioItem = portfolio[sym];
                if (!portfolioItem || portfolioItem.totalUnits <= 0) return;

                // ค้นหา Sector ของหุ้นตัวนี้จากข้อมูลการซื้อขายล่าสุด
                const trade = globalTradesData.find(
                    t => String(t.symbol || "").trim().toUpperCase() === sym
                );

                const stockSector = trade ? (trade.sector || "อื่นๆ") : "อื่นๆ";

                if (stockSector === key) {
                    const price = Number(window.currentPrices && window.currentPrices[sym]) || portfolioItem.avgPrice;
                    value += portfolioItem.totalUnits * price;
                }
            });
        }

        if (value > 0) {
            labels.push(key);
            values.push(value);
        }
    });
if (chartFilter === "top10") {

    const arr = labels.map((label, i) => ({
        label,
        value: values[i]
    }));

    arr.sort((a, b) => b.value - a.value);

    labels.length = 0;
    values.length = 0;

    arr.slice(0, 10).forEach(item => {
        labels.push(item.label);
        values.push(item.value);
    });
}
    const canvas = document.getElementById("allocationChart");
    if (!canvas) return;

    if (window.allocationChart && typeof window.allocationChart.destroy === "function") {
        window.allocationChart.destroy();
    }

window.allocationChart = new Chart(canvas, {
    type: "doughnut",

    data: {
        labels: labels,
        datasets: [{
            data: values
        }]
    },

options: {

    onClick: function(evt, elements) {

        if (!elements.length) return;

        const index = elements[0].index;
        const label = labels[index];

        filterMonitorTable(label);
    },

    plugins: {
            legend: {
                position: "bottom"
            },

            datalabels: {
                color: "#fff",
                font: {
                    weight: "bold",
                    size: 12
                },
                formatter: function(value, ctx) {
                    const total = ctx.dataset.data.reduce((a,b)=>a+b,0);
                    const percent = total > 0 ? value / total * 100 : 0;
                    return percent >= 3 ? percent.toFixed(1) + "%" : "";
                }
            },

            tooltip: {
                callbacks: {
                    label: function (ctx) {
                        let total = ctx.dataset.data.reduce((a,b)=>a+b,0);
                        let percent = total > 0 ? (ctx.raw / total * 100).toFixed(2) : 0;

                        return " " + ctx.label + ": " +
                               ctx.raw.toLocaleString(undefined,{maximumFractionDigits:2}) +
                               " บาท (" + percent + "%)";
                    }
                }
            }
        }
    },

    plugins: [ChartDataLabels]
});
}

function toggleChartFilter() {

    chartFilter = chartFilter === "all" ? "top10" : "all";

    document.getElementById("chartFilterBtn").innerText =
        chartFilter === "all" ? "Top 10" : "แสดงทั้งหมด";

    drawAllocationChart(currentMonitorView || "stock");
}
function buildDividendYear() {
    const yearSelect = document.getElementById("dividendYear");
    if (!yearSelect) return;

    yearSelect.innerHTML = `<option value="0">ทุกปี</option>`;

    let years = [];
    globalTradesData.forEach(t => {
        if (String(t.type).trim() === "ปันผล") {
            let date = new Date(t.date);
            let year = date.getFullYear();
            if (!isNaN(year) && !years.includes(year)) {
                years.push(year);
            }
        }
    });

    years.sort((a, b) => b - a);

    years.forEach(year => {
        let option = document.createElement("option");
        option.value = year;
        option.text = year;
        yearSelect.appendChild(option);
    });

    console.log("Dividend Years:", years);
}
function buildCalendarYear(){

    const select = document.getElementById("calendarYear");

    if(!select) return;

    select.innerHTML = `
        <option value="0">
            ทุกปี
        </option>
    `;

    let years=[];

    globalTradesData.forEach(t=>{

        if(String(t.type).trim() !== "ปันผล") return;

        const y = new Date(t.date).getFullYear();

        if(!years.includes(y)){
            years.push(y);
        }

    });


    years.sort((a,b)=>b-a);


    years.forEach(y=>{

        const option=document.createElement("option");

        option.value=y;
        option.text=y;

        select.appendChild(option);

    });

}

function filterMonitorTable(label) {

    if (currentMonitorView === "stock") {

        const data = {};
        data[label] = portfolio[label];

        renderMonitorTable(data, realizedPnL);

    } else {

        const data = {};

        Object.keys(portfolio).forEach(sym => {

            const trade = globalTradesData.find(
                t => String(t.symbol).trim().toUpperCase() === sym
            );

            if (trade && trade.sector === label) {
                data[sym] = portfolio[sym];
            }

        });

        renderMonitorTable(data, realizedPnL);
    }
}

function getDividendSummary(sym, year = 0, month = 0) {

    if (!dividendData[sym]) {
        return {
            count: 0,
            amount: 0,
            dpu: 0,
            cost: 0,
            yield: 0
        };
    }

    let count = 0;
    let amount = 0;
    let dpu = 0;
    let cost = 0;
    let units = 0;

    dividendData[sym].items.forEach(item => {

        const d = new Date(item.date);

        if (year && d.getFullYear() !== year) return;
        if (month && (d.getMonth() + 1) !== month) return;

    count++;
amount += item.amount;
dpu += item.dpu;
cost += item.costAtXD || 0;
units += item.units || 0;

    });

    return {

        count,

        amount,

        dpu: count ? dpu / count : 0,

        cost,
        units,

        yield: cost ? (amount / cost) * 100 : 0

    };

}

function renderDividendTable() {
    const tbody = document.getElementById("dividendTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    const year = Number(document.getElementById("dividendYear").value);
    const month = Number(document.getElementById("dividendMonth").value);

    const stockFilter =
        document.getElementById("dividendStockFilter")?.value
        .trim()
        .toUpperCase() || "";

    let result = {};
    let total = 0;
    let allTotal = 0;
    let allCount = 0;
    let allStock = {};

    globalTradesData.forEach(t => {

        if (String(t.type).trim() !== "ปันผล") {
            return;
        }

        const symbol = String(t.symbol || "")
            .trim()
            .toUpperCase();

        // 🔍 Filter หุ้น
        if (stockFilter && !symbol.includes(stockFilter)) {
            return;
        }

        const amount = Number(t.netAmount) || 0;

        allTotal += amount;
        allCount++;
        allStock[symbol] = true;

        const d = new Date(t.date);

        if (year > 0 && d.getFullYear() !== year) {
            return;
        }

        if (month > 0 && (d.getMonth() + 1) !== month) {
            return;
        }

        if (!result[symbol]) {
            result[symbol] = {
                count: 0,
                amount: 0,
                dpu: 0,
                units: 0
            };
        }

        result[symbol].count++;
        result[symbol].amount += amount;
        result[symbol].dpu += Number(t.price) || 0;
        result[symbol].units += Number(t.units) || 0;

        total += amount;
    });

    document.getElementById("dividendSelectedTotal").innerText =
        total.toLocaleString(undefined, {
            minimumFractionDigits: 2
        });

    document.getElementById("dividendAllTotal").innerText =
        allTotal.toLocaleString(undefined, {
            minimumFractionDigits: 2
        });

    document.getElementById("dividendStockCount").innerText =
        Object.keys(allStock).length;

    document.getElementById("dividendCount").innerText =
        allCount;

    document.getElementById("dividendYearTotal").innerText =
        total.toLocaleString(undefined, {
            minimumFractionDigits: 2
        });

    document.getElementById("dividendGrowth").innerText =
        calculateDividendGrowth() + "%";

    document.getElementById("dividendAvgMonth").innerText =
        calculateAverageDividendMonth().toLocaleString(undefined, {
            minimumFractionDigits: 2
        }) + " บาท";

    const top = calculateTopDividendStock();

    document.getElementById("dividendTopStock").innerText =
        top.symbol;

    document.getElementById("dividendTopAmount").innerText =
        top.amount.toLocaleString(undefined, {
            minimumFractionDigits: 2
        }) + " บาท";

    document.getElementById("dividendTopPercent").innerText =
        top.percent + "% ของ Dividend ทั้งหมด";

    // สร้างข้อมูลก่อนเรียง
    let rows = Object.keys(result).map(symbol => {

        const info = getDividendSummary(
            symbol,
            year,
            month
        );

        return {
            symbol: symbol,
            count: info.count,
            dpu: info.dpu,
            units: result[symbol].units,
            amount: info.amount,
            cost: info.cost,
            yield: info.yield
        };
    });

    // เรียงข้อมูล
    const sortType =
        document.getElementById("dividendSort").value;

    rows.sort((a, b) => {

        switch (sortType) {

            case "yield":
                return b.yield - a.yield;

            case "amount":
                return b.amount - a.amount;

            case "cost":
                return b.cost - a.cost;

            case "dpu":
                return b.dpu - a.dpu;

            case "symbol":
                return a.symbol.localeCompare(b.symbol);

            default:
                return 0;
        }
    });

    // แสดงตาราง
    rows.forEach(item => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${item.symbol}</td>
            <td>${item.count}</td>
            <td>${item.dpu.toFixed(2)}</td>
            <td>${item.units.toLocaleString()}</td>
            <td>${item.amount.toLocaleString(undefined, {
                minimumFractionDigits: 2
            })}</td>
            <td>${item.cost.toLocaleString(undefined, {
                minimumFractionDigits: 2
            })}</td>
            <td>${item.yield.toFixed(2)}%</td>
        `;

        tbody.appendChild(row);
    });

    if (typeof renderDividendMonthlyChart === "function") {
        renderDividendMonthlyChart();
    }

    if (typeof renderDividendStockChart === "function") {
        renderDividendStockChart();
    }

    if (typeof renderDividendYearChart === "function") {
        renderDividendYearChart();
    }
}
function renderDividendKPI(){

    let yearTotal = {};
    let stockTotal = {};
    let monthTotal = {};

    let totalDividend = 0;


    globalTradesData.forEach(t=>{

        if(String(t.type).trim() !== "ปันผล") return;


        const amount = Number(t.netAmount)||0;

        const d = new Date(t.date);


        // ปี
        const year = d.getFullYear();

        yearTotal[year] = 
            (yearTotal[year] || 0) + amount;


        // หุ้น
        const sym = String(t.symbol)
            .trim()
            .toUpperCase();

        stockTotal[sym] =
            (stockTotal[sym] || 0) + amount;


        // เดือน
        const month = d.getMonth()+1;

        monthTotal[month] =
            (monthTotal[month] || 0) + amount;


        totalDividend += amount;

    });


    // ปีล่าสุด
    const years = Object.keys(yearTotal)
        .sort((a,b)=>b-a);


    const latestYear = years[0];


    document.getElementById(
        "dividendLatestYear"
    ).innerText =
        latestYear
        ? yearTotal[latestYear]
            .toLocaleString(undefined,{minimumFractionDigits:2})
        : "0.00";



    // หุ้นสูงสุด

    let topStock="-";
    let maxStock=0;

    Object.keys(stockTotal)
    .forEach(sym=>{

        if(stockTotal[sym]>maxStock){

            maxStock=stockTotal[sym];
            topStock=sym;

        }

    });


    document.getElementById(
        "dividendTopStock"
    ).innerText = topStock;



    // เดือนสูงสุด

    let topMonth="-";
    let maxMonth=0;

    Object.keys(monthTotal)
    .forEach(m=>{

        if(monthTotal[m]>maxMonth){

            maxMonth=monthTotal[m];
            topMonth=m;

        }

    });


    const monthName=[
        "",
        "มกราคม",
        "กุมภาพันธ์",
        "มีนาคม",
        "เมษายน",
        "พฤษภาคม",
        "มิถุนายน",
        "กรกฎาคม",
        "สิงหาคม",
        "กันยายน",
        "ตุลาคม",
        "พฤศจิกายน",
        "ธันวาคม"
    ];


    document.getElementById(
        "dividendTopMonth"
    ).innerText =
        topMonth!="-" 
        ? monthName[topMonth]
        : "-";



// Yield รวม (ใช้ข้อมูลเดียวกับ Dividend Monitor)

let totalCost = 0;
let totalAmount = 0;

Object.keys(dividendData).forEach(sym => {

    const info = getDividendSummary(sym);

    totalAmount += info.amount;
    totalCost += info.cost;

});

const yieldTotal =
    totalCost > 0
        ? (totalAmount / totalCost) * 100
        : 0;

document.getElementById("dividendTotalYield").innerText =
    yieldTotal.toFixed(2) + "%";


}

function switchTab(tab) {

// ซ่อนทุกหน้า
document.getElementById("portfolioTab").style.display = "none";
document.getElementById("dividendTab").style.display = "none";
document.getElementById("settingsTab").style.display = "none";
document.getElementById("analyticsTab").style.display = "none";
document.getElementById("goalsTab").style.display = "none";


// รีเซ็ตสีปุ่ม
document.getElementById("tabPortfolioBtn").classList.remove("active");
document.getElementById("tabDividendBtn").classList.remove("active");
document.getElementById("tabSettingsBtn").classList.remove("active");
document.getElementById("tabAnalyticsBtn").classList.remove("active");
document.getElementById("tabGoalsBtn").classList.remove("active");


    // Portfolio
    if (tab === "portfolio") {

        document.getElementById("portfolioTab").style.display = "block";
        document.getElementById("tabPortfolioBtn").classList.add("active");

    }


    // Dividend
    if (tab === "dividend") {

        document.getElementById("dividendTab").style.display = "block";
        document.getElementById("tabDividendBtn").classList.add("active");


        buildDividendYear();
        buildCalendarYear();

        renderDividendTable();
        renderDividendCalendar();
        renderDividendKPI();

    }

if (tab === "goals") {

    document.getElementById("goalsTab").style.display = "block";
    document.getElementById("tabGoalsBtn").classList.add("active");

    const frame = document.querySelector("#goalsTab iframe");

    if (frame && frame.contentWindow && typeof frame.contentWindow.loadGoals === "function") {
        frame.contentWindow.loadGoals();
    }

}

    // Settings
    if (tab === "settings") {

        document.getElementById("settingsTab").style.display = "block";
        document.getElementById("tabSettingsBtn").classList.add("active");

    }


    // Analytics
    if (tab === "analytics") {

        document.getElementById("analyticsTab").style.display = "block";
        document.getElementById("tabAnalyticsBtn").classList.add("active");


        // โหลดข้อมูล Analytics ใหม่ทุกครั้งที่เปิด Tab
        const iframe = document.querySelector("#analyticsTab iframe");

        if (iframe && iframe.contentWindow.loadAnalytics) {
            iframe.contentWindow.loadAnalytics();
        }

    }

}
function renderDividendHistory() {
    const historyTbody = document.getElementById("dividendHistoryBody");
    if (!historyTbody) return;

    let html = "";
    const historyData = globalTradesData.filter(
        t => String(t.type).trim() === "ปันผล"
    );

    historyData
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, dividendHistoryLimit)
        .forEach(t => {

            const dpu = Number(t.price || 0);
            const units = Number(t.units || 0);
            const gross = Number(t.grossAmount || 0);
            const net = Number(t.netAmount || 0);
            const tax = Math.max(0, gross - net);

            html += `
            <tr>
                <td>${new Date(t.date).toLocaleDateString("th-TH")}</td>
                <td>${t.symbol}</td>
                <td class="text-end">${dpu.toLocaleString(undefined,{minimumFractionDigits:2})}</td>
                <td class="text-end">${units.toLocaleString()}</td>
                <td class="text-end">${gross.toLocaleString(undefined,{minimumFractionDigits:2})}</td>
                <td class="text-end">${tax.toLocaleString(undefined,{minimumFractionDigits:2})}</td>
                <td class="text-end fw-bold">${net.toLocaleString(undefined,{minimumFractionDigits:2})}</td>
            </tr>
            `;
        });

    historyTbody.innerHTML = html;

    const btn = document.getElementById("btnShowAllDividend");

    if (btn) {
        btn.style.display =
            historyData.length > 10
                ? "inline-block"
                : "none";
    }
}

function showAllDividendHistory() {

    dividendHistoryLimit = 999999;

    renderDividendHistory();

    document.getElementById("btnShowAllDividend").style.display = "none";

}
function toggleDividendHistory() {

    showAllDividend = !showAllDividend;

    dividendHistoryLimit = showAllDividend
        ? 999999
        : 10;

    document.getElementById("btnShowAllDividend").innerText =
        showAllDividend ? "🔼 ย่อ" : "📄 ดูทั้งหมด";

    renderDividendHistory();
}

function renderDividendCalendar() {

    const container = document.getElementById("dividendCalendar");

    if (!container) return;

    container.innerHTML = "";


   const yearSelect = document.getElementById("calendarYear");

const year = yearSelect 
    ? Number(yearSelect.value)
    : 0;

    const months = [
        "🌸 มกราคม",
        "❤️ กุมภาพันธ์",
        "🌿 มีนาคม",
        "🌼 เมษายน",
        "🌻 พฤษภาคม",
        "☀️ มิถุนายน",
        "🏖️ กรกฎาคม",
        "🍂 สิงหาคม",
        "🍁 กันยายน",
        "🎃 ตุลาคม",
        "❄️ พฤศจิกายน",
        "🎄 ธันวาคม"
    ];

    let monthData = {};

    // เตรียมข้อมูล 12 เดือน
    for(let i=1;i<=12;i++){

        monthData[i]={
            total:0,
            items:[]
        };

    }

    // รวมข้อมูล
    globalTradesData.forEach(t=>{

        if(String(t.type).trim()!=="ปันผล") return;

        const d=new Date(t.date);

        if(year>0 && d.getFullYear()!=year) return;

        const m=d.getMonth()+1;

        monthData[m].items.push({
            symbol:t.symbol,
            amount:Number(t.netAmount)||0
        });

        monthData[m].total+=Number(t.netAmount)||0;

    });

    // สร้าง Card
    for(let i=1;i<=12;i++){

        const data=monthData[i];

        let html=`
        <div class="col-12 col-md-6 col-lg-4">

            <div class="calendar-card ${data.items.length>0?"has-dividend":"no-dividend"}">

                <div class="d-flex justify-content-between align-items-center mb-2">

                    <div class="calendar-title">
                        ${months[i-1]}
                    </div>

                    <div class="calendar-total">
                        ฿${data.total.toLocaleString()}
                    </div>

                </div>
        `;

        if(data.items.length===0){

            html+=`
                <div class="calendar-empty">
                    ไม่มีปันผล
                </div>
            `;

}else{

    // เรียงจากเงินปันผลมาก → น้อย
    data.items.sort((a, b) => b.amount - a.amount);

    // นับจำนวนบริษัทไม่ซ้ำ
    const companyCount = new Set(
        data.items.map(item => item.symbol)
    ).size;

    html += `
        <div class="text-muted mb-2">
            🏢 ${companyCount} บริษัท
        </div>
    `;

    // ===== แสดง 3 รายการแรก =====
    html += `<div id="dividend-preview-${i}">`;

    data.items.slice(0,3).forEach(item=>{

        html += `
        <div class="calendar-item">
            <span>${item.symbol}</span>
            <span>${item.amount.toLocaleString()}</span>
        </div>
        `;

    });

    html += `</div>`;

    // ===== ถ้ามีมากกว่า 3 รายการ =====
    if(data.items.length > 3){

        html += `
        <div class="calendar-more"
             id="dividend-btn-${i}"
             onclick="toggleDividendDetail(${i})">

            👁 ดูทั้งหมด ${data.items.length} รายการ

        </div>

        <div id="dividend-detail-${i}" style="display:none;">
        `;

        data.items.forEach(item=>{

            html += `
            <div class="calendar-item">
                <span>${item.symbol}</span>
                <span>${item.amount.toLocaleString()}</span>
            </div>
            `;

        });

        html += `</div>`;

    }

}
        html+=`
            </div>

        </div>
        `;

      container.innerHTML += html;
    

    }

}


function showDividendDetail(month, items, total){

    document.getElementById("dividendModalTitle")
    .innerText = month;

    let html="";

    items.forEach(item=>{

        html += `
        <div class="d-flex justify-content-between mb-2">

            <span>
                ${item.symbol}
            </span>

            <b>
                ${item.amount.toLocaleString()} บาท
            </b>

        </div>
        `;

    });

    html += `
    <hr>
    <div class="text-end fw-bold">
        รวม ${total.toLocaleString()} บาท
    </div>
    `;

    document.getElementById("dividendModalBody")
    .innerHTML = html;


    const modal =
    new bootstrap.Modal(
        document.getElementById("dividendDetailModal")
    );

    modal.show();

}
function renderDividendMonthlyChart() {
    const year = Number(
        document.getElementById("dividendYear").value
    );

    let monthly = [
        0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0
    ];

    globalTradesData.forEach(t => {
        if (String(t.type).trim() !== "ปันผล")
            return;

        const d = new Date(t.date);

        if (year > 0 && d.getFullYear() !== year)
            return;

        const month = d.getMonth();
        monthly[month] += Number(t.netAmount) || 0;
    });

    const ctx = document.getElementById("dividendMonthlyChart");
    if (!ctx) return;

    // ลบกราฟเก่า
    if (dividendMonthlyChart) {
        dividendMonthlyChart.destroy();
    }

    dividendMonthlyChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: [
                "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
                "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
            ],
            datasets: [{
                label: "Dividend (บาท)",
                data: monthly
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

function renderDividendStockChart() {
    const year = Number(
        document.getElementById("dividendYear").value
    );

    let stockData = {};

    globalTradesData.forEach(t => {
        if (String(t.type).trim() !== "ปันผล")
            return;

        const d = new Date(t.date);

        if (year > 0 && d.getFullYear() !== year)
            return;

        const sym = String(t.symbol).toUpperCase();

        if (!stockData[sym]) {
            stockData[sym] = 0;
        }

        stockData[sym] += Number(t.netAmount) || 0;
    });

    const labels = Object.keys(stockData);
    const values = Object.values(stockData);

    const ctx = document.getElementById("dividendStockChart");
    if (!ctx) return;

    // ลบกราฟเก่า
    if (dividendStockChart) {
        dividendStockChart.destroy();
    }

    dividendStockChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [{
                label: "Dividend",
                data: values
            }]
        },
        plugins: [ChartDataLabels],
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom"
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = context.dataset.data
                                .reduce((sum, val) => sum + val, 0);

                            const percent = total > 0
                                ? ((value / total) * 100).toFixed(2)
                                : 0;

                            return [
                                context.label,
                                value.toLocaleString(undefined, {
                                    minimumFractionDigits: 2
                                }) + " บาท",
                                percent + "%"
                            ];
                        }
                    }
                },
                datalabels: {
                    color: "#ffffff",
                    formatter: function(value, context) {
                        const total = context.chart.data.datasets[0].data
                            .reduce((sum, val) => sum + val, 0);

                        const percent = total > 0
                            ? ((value / total) * 100).toFixed(1)
                            : 0;

                        return [
                            context.chart.data.labels[context.dataIndex],
                            percent + "%"
                        ];
                    },
                    font: {
                        weight: "bold",
                        size: 12
                    }
                }
            }
        }
    });
}
function renderDividendYearChart(){

    let yearData = {};


    globalTradesData.forEach(t=>{

        if(String(t.type).trim() !== "ปันผล")
            return;


        const d = new Date(t.date);

        const year = d.getFullYear() + 543;


        if(!yearData[year]){
            yearData[year] = 0;
        }


        yearData[year] += Number(t.netAmount) || 0;

    });



    const labels = Object.keys(yearData)
        .sort((a,b)=>a-b);


    const values = labels.map(y=>yearData[y]);



    const ctx = document.getElementById(
        "dividendYearChart"
    );


    if(!ctx) return;



    if(dividendYearChart){
        dividendYearChart.destroy();
    }



    dividendYearChart = new Chart(ctx,{

        type:"bar",

        data:{

            labels:labels,

            datasets:[{

                label:"Dividend (บาท)",

                data:values

            }]

        },


        options:{

            responsive:true,

            maintainAspectRatio:false,

            animation:false

        }

    });

}

function calculateDividendGrowth(){

    let yearly = {};


    globalTradesData.forEach(t=>{

        if(String(t.type).trim() !== "ปันผล")
            return;


        const year =
            new Date(t.date).getFullYear();


        if(!yearly[year]){
            yearly[year] = 0;
        }


        yearly[year] += Number(t.netAmount) || 0;

    });



    const years = Object.keys(yearly)
        .sort((a,b)=>b-a);


    if(years.length < 2)
        return "0";


    const latest = yearly[years[0]];
    const previous = yearly[years[1]];


    if(previous === 0)
        return "0";


    return (
        ((latest - previous) / previous) * 100
    ).toFixed(2);

}
function calculateTopDividendStock(){

    let stock = {};


    globalTradesData.forEach(t=>{

        if(String(t.type).trim() !== "ปันผล")
            return;


        const sym = String(t.symbol)
                    .toUpperCase();


        stock[sym] =
            (stock[sym] || 0)
            + (Number(t.netAmount) || 0);

    });



    let maxStock = "";
    let maxAmount = 0;


    Object.keys(stock).forEach(sym=>{

        if(stock[sym] > maxAmount){

            maxAmount = stock[sym];
            maxStock = sym;

        }

    });


    const total =
        Object.values(stock)
        .reduce((a,b)=>a+b,0);



    const percent =
        total > 0
        ? ((maxAmount / total)*100).toFixed(2)
        : 0;



    return {
        symbol:maxStock,
        amount:maxAmount,
        percent:percent
    };

}

function calculateAverageDividendMonth(){

    let total = 0;

    globalTradesData.forEach(t=>{

        if(String(t.type).trim() !== "ปันผล")
            return;

        total += Number(t.netAmount) || 0;

    });


    return total / 12;

}
function toggleDividendDetail(month){

    const preview = document.getElementById("dividend-preview-" + month);
    const detail = document.getElementById("dividend-detail-" + month);
    const btn = document.getElementById("dividend-btn-" + month);

    if(!preview || !detail || !btn) return;

    if(detail.style.display === "none"){

        preview.style.display = "none";
        detail.style.display = "block";
        btn.innerHTML = "▲ ซ่อนรายการ";

    }else{

        preview.style.display = "block";
        detail.style.display = "none";
        btn.innerHTML = `👁 ดูทั้งหมด ${detail.children.length} รายการ`;

    }

}

function getHoldingAtDate(symbol, targetDate) {

    let units = 0;
    let cost = 0;

    const dateLimit = new Date(targetDate);

    const history = globalTradesData
        .filter(t => {
            return (
                String(t.symbol).toUpperCase() === String(symbol).toUpperCase() &&
                new Date(t.date) <= dateLimit &&
                (t.type === "ซื้อ" || t.type === "ขาย")
            );
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));


    history.forEach(t => {

        const qty = Number(t.units) || 0;
        const amount = Number(t.grossAmount) || 0;


        // ซื้อ
        if (t.type === "ซื้อ") {

            units += qty;
            cost += amount;

        }


        // ขาย
        if (t.type === "ขาย") {

            if (units > 0) {

                const avgCost = cost / units;

                units -= qty;
                cost -= avgCost * qty;

            }

        }

    });


    return {
        units: units,
        cost: cost,
        avgPrice: units > 0 ? cost / units : 0
    };

}

function updateSubmitButton(isEdit = false){

    const btn = document.getElementById("submitBtn");

    if(!btn) return;

    btn.disabled = false;

    if(isEdit){

        btn.innerHTML = "🟠 💾 บันทึกการแก้ไข";
        btn.className = "btn btn-warning w-100 fw-bold";

    }else{

        btn.innerHTML = "🟢 💾 บันทึกรายการใหม่";
        btn.className = "btn btn-success w-100 fw-bold";

    }

}
function renderAlertSummary(alerts = []) {

    const box = document.getElementById("alertBox");
    const title = document.getElementById("alertTitle");
    const summary = document.getElementById("alertSummary");
    const detail = document.getElementById("alertDetail");
    const btn = document.getElementById("alertToggleBtn");

    if (!box || !summary) return;

    // ไม่มี Alert
    if (alerts.length === 0) {
        box.style.display = "none";
        return;
    }

    box.style.display = "block";

    currentAlerts = alerts;

    const danger = alerts.filter(a => a.startsWith("🔴")).length;
    const warning = alerts.filter(a => a.startsWith("🟠")).length;

    if (title) {
        title.innerHTML = `🚨 ALERT (${alerts.length})`;
    }

summary.innerHTML = `
    ${danger > 0 ? `<div>🔴 ความเสี่ยงสูง ${danger} รายการ</div>` : ""}
    ${warning > 0 ? `<div>🟠 ควรติดตาม ${warning} รายการ</div>` : ""}
`;

    if (detail) {
        detail.style.display = "none";
        detail.innerHTML = "";
    }

    if (btn) {
        btn.innerHTML = "▼ ดูรายละเอียด";
    }
}

function generatePortfolioAlerts(){

    let alerts = [];

    // วนหุ้นใน Portfolio
    Object.keys(portfolio).forEach(sym => {

        const stock = portfolio[sym];

        if(stock.totalUnits <= 0) return;


        // ราคาปัจจุบัน
        const currentPrice =
            (window.currentPrices && window.currentPrices[sym])
            ? Number(window.currentPrices[sym])
            : stock.avgPrice;


        // มูลค่าหุ้นตัวนี้
        const marketValue =
            stock.totalUnits * currentPrice;


        // มูลค่าพอร์ตทั้งหมด
        const totalValue =
            Object.keys(portfolio).reduce((sum, s) => {

                const item = portfolio[s];

                const price =
                    (window.currentPrices && window.currentPrices[s])
                    ? Number(window.currentPrices[s])
                    : item.avgPrice;

                return sum + (item.totalUnits * price);

            },0);


        // % สัดส่วนพอร์ต
        const weight =
            totalValue > 0
            ? (marketValue / totalValue) * 100
            : 0;


        // Alert หุ้นถือเกิน 40%
        if(weight >= 40){

            alerts.push(
                `🔴 ${sym} สัดส่วนพอร์ตสูง (${weight.toFixed(1)}%)`
            );

        }


        // Unrealized P/L %
        const cost = stock.totalCost;

        const pnlPercent =
            cost > 0
            ? ((marketValue - cost) / cost) * 100
            : 0;


        // ขาดทุนเกิน 10%
        if(pnlPercent <= -10){

            alerts.push(
                `🔴 ${sym} ขาดทุน ${pnlPercent.toFixed(1)}%`
            );

        }


        // กำไรเกิน 40%
        if(pnlPercent >= 40){

            alerts.push(
                `🟠 ${sym} กำไรเพิ่มขึ้น ${pnlPercent.toFixed(1)}%`
            );

        }


    });


    return alerts;

}
function toggleAlertDetail(){

    const detail = document.getElementById("alertDetail");
    const btn = document.getElementById("alertToggleBtn");

    if (!detail || !btn) return;

    if(detail.style.display === "none"){

        detail.style.display = "block";

        btn.innerHTML = "▲ ซ่อนรายละเอียด";

        detail.innerHTML =
            currentAlerts
                .map(a => `<div class="small mb-1">${a}</div>`)
                .join("");

    }else{

        detail.style.display = "none";
        detail.innerHTML = "";

        btn.innerHTML = "▼ ดูรายละเอียด";

    }

}

window.onload = function() {

    const dateInput = document.getElementById('date');

    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }

    initConnection();

};
