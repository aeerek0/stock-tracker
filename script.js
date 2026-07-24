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
        const feeGroup = document.getElementById('feeRate').parentElement;

        // แสดงทุกอย่างก่อน
        symbolGroup.style.display = "";
        sectorGroup.style.display = "";
        brokerGroup.style.display = "";
        priceGroup.style.display = "";
        unitsGroup.style.display = "";
        feeGroup.style.display = "";
        amountContainer.style.display = "none";

        if (type === "ฝากเงิน" || type === "ถอนเงิน") {
            amountContainer.style.display = "block";
            symbolGroup.style.display = "none";
            sectorGroup.style.display = "none";
            brokerGroup.style.display = "none";
            priceGroup.style.display = "none";
            unitsGroup.style.display = "none";
            feeGroup.style.display = "none";
        }

if (type === "ปันผล") {
    amountContainer.style.display = "block";

    // ปันผลใช้ Symbol + Sector + Price(DPU) + Units
    symbolGroup.style.display = "";
    sectorGroup.style.display = "";
    brokerGroup.style.display = "";

    priceGroup.style.display = "";
    unitsGroup.style.display = "";

    // ไม่ต้องใช้ค่าธรรมเนียม
    feeGroup.style.display = "none";
}
});
    
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
    const sym = String(symbolValue).trim().toUpperCase();
    document.getElementById('symbol').value = sym; 
    
    if (masterSectorMap[sym]) {
        document.getElementById('sector').value = masterSectorMap[sym];
    } else if (dynamicSectorMap[sym]) {
        document.getElementById('sector').value = dynamicSectorMap[sym];
    }
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
            globalTradesData = data.trades || [];
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

    // ดึงข้อมูลเก่าลงฟอร์มคีย์
    let dateVal = trade.date;
    if (dateVal.includes("T")) dateVal = dateVal.split("T")[0];
    
    document.getElementById('editRowIndex').value = trade.rowIndex;
    document.getElementById('date').value = dateVal;
    document.getElementById('type').value = trade.type;
    document.getElementById('symbol').value = trade.symbol;
    document.getElementById('sector').value = trade.sector || '';
    document.getElementById('broker').value = trade.broker || '';
    document.getElementById('price').value = trade.price;
    document.getElementById('units').value = trade.units;
    
// แสดงค่าธรรมเนียมจริง (บาท)
document.getElementById('feeRate').value =
    Number(trade.feeTax || 0).toFixed(2);

    // เปลี่ยนดีไซน์หน้าตาฟอร์มให้รู้ว่ากำลังแก้ไข
    document.getElementById('formTitle').innerText = "✏️ แก้ไขข้อมูลรายการ";
    document.getElementById('editAlert').style.display = "block";
    document.getElementById('submitBtn').innerText = "🆙 อัปเดตข้อมูลไปยัง Google Sheets";
    document.getElementById('submitBtn').style.backgroundColor = "var(--pastel-edit)";
    
    // เลื่อนหน้าจอขึ้นไปที่ฟอร์มคีย์อัตโนมัติ
    document.getElementById('tradeForm').scrollIntoView({ behavior: 'smooth' });
}

// ฟังก์ชันยกเลิกโหมดแก้ไข
function cancelEditMode() {
    document.getElementById('editRowIndex').value = "";
    document.getElementById('tradeForm').reset();
    document.getElementById('date').valueAsDate = new Date();
    document.getElementById('feeRate').value = "0.0";

    document.getElementById('formTitle').innerText = "➕ บันทึกรายการใหม่";
    document.getElementById('editAlert').style.display = "none";

    const btn = document.getElementById('submitBtn');
    btn.disabled = false;   // <<< เพิ่มบรรทัดนี้
    btn.innerText = "💾 บันทึกส่งไปยัง Google Sheets";
    btn.style.backgroundColor = "var(--pastel-orange-dark)";
}

function renderMonitorTable(dataMap, pnLMap, sortedKeys = null) {
    const mBody = document.getElementById('monitorTableBody');
    mBody.innerHTML = '';
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
            marketValue = data.totalCost;
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
            marketPrice = data.avgPrice;
            marketValue = data.totalCost;
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
let dividendReceived = 0;

globalTradesData.forEach(trade => {
    if (
        trade.type === "ปันผล" &&
        String(trade.symbol).trim().toUpperCase() === key
    ) {
        dividendReceived += Number(trade.netAmount || 0);
    }
});

const dividendYield = data.totalCost > 0
    ? (dividendReceived / data.totalCost) * 100
    : 0;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="fw-bold">${key}</td>
            <td>${data.totalUnits.toLocaleString()}</td>
            <td>${data.avgPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
            <td>${data.totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
            <td>${marketPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
            <td>${marketValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
            <td class="text-secondary fw-bold">${weight.toFixed(1)}%</td>
            <td class="${totalPnL >= 0 ? 'text-success' : 'text-danger'}">${totalPnL.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
            <td class="${roi >= 0 ? 'text-success' : 'text-danger'}">${roi.toFixed(2)}%</td>
<td class="text-primary fw-bold">${dividendYield.toFixed(2)}%</td>
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
    
    // 1. เตรียมตัวแปรสำหรับเก็บข้อมูลทั้งแบบรายหุ้นและราย Sector
 
    portfolio = {};
sectorPortfolio = {};

realizedPnL = {};
unrealizedPnL = {};

sectorPnL = {};
sectorUnrealizedPnL = {};

dividendData = {};
dividendCostBasis = {};
 
    const tbodyRecord = document.getElementById('tradeTableBody');
    tbodyRecord.innerHTML = '';

    // 2. ลูปคำนวณข้อมูลทั้งหมด
    let totalPortfolioValue = 0, totalPnL = 0, activeStocksCount = 0;
    
    const sortedTrades = [...globalTradesData].sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
});

sortedTrades.forEach(trade => {
if (trade.type === 'ปันผล') {

    const sym = String(trade.symbol || "").trim().toUpperCase();

    if (!dividendData[sym]) {

        dividendData[sym] = {
            count: 0,
            amount: 0,
            items: [],
            totalCost: 0
        };

    }

    const amount = Number(trade.netAmount) || 0;

    dividendData[sym].count++;

    dividendData[sym].amount += amount;

    // ⭐ เก็บต้นทุน ณ วันที่รับปันผล
    const costAtDividend =
        portfolio[sym]
            ? portfolio[sym].totalCost
            : 0;

    dividendData[sym].totalCost += costAtDividend;

    dividendData[sym].items.push({

        date: trade.date,

        amount: amount,

        dpu: Number(trade.price) || 0,

        units: Number(trade.units) || 0,

        cost: costAtDividend

    });

    return;
}
        if (trade.type === 'ฝากเงิน' || trade.type === 'ถอนเงิน') return;

        const sym = String(trade.symbol || "").trim().toUpperCase();
        const sector = String(trade.sector || "อื่นๆ").trim();
        const units = parseInt(trade.units);
        const netAmount = parseFloat(trade.netAmount);

        // คำนวณรายหุ้น
        if (!portfolio[sym]) {
            portfolio[sym] = { totalUnits: 0, totalCost: 0, avgPrice: 0 };
            realizedPnL[sym] = 0;
        }
        
        // คำนวณราย Sector
        if (!sectorPortfolio[sector]) {
            sectorPortfolio[sector] = { totalUnits: 0, totalCost: 0, avgPrice: 0 };
            sectorPnL[sector] = 0;
        }

        if (trade.type === 'ซื้อ') {
            portfolio[sym].totalUnits += units;
            portfolio[sym].totalCost += netAmount;
            if (!dividendCostBasis[sym]) {
            dividendCostBasis[sym] = 0;
                }

dividendCostBasis[sym] += netAmount;
            portfolio[sym].avgPrice = portfolio[sym].totalUnits > 0 ? portfolio[sym].totalCost / portfolio[sym].totalUnits : 0;
            
            sectorPortfolio[sector].totalUnits += units;
            sectorPortfolio[sector].totalCost += netAmount;
            sectorPortfolio[sector].avgPrice = sectorPortfolio[sector].totalUnits > 0 ? sectorPortfolio[sector].totalCost / sectorPortfolio[sector].totalUnits : 0;
        } else {
            const costOfSoldShares = units * portfolio[sym].avgPrice;
            const sectorCostOfSold = units * sectorPortfolio[sector].avgPrice;
            
            realizedPnL[sym] += (netAmount - costOfSoldShares);
            sectorPnL[sector] += (netAmount - sectorCostOfSold);
            
            portfolio[sym].totalUnits -= units;
            portfolio[sym].totalCost -= costOfSoldShares;
            
            sectorPortfolio[sector].totalUnits -= units;
            sectorPortfolio[sector].totalCost -= sectorCostOfSold;
        }
    });

    // ===============================
    // คำนวณ Unrealized P/L
    // ===============================
    Object.keys(portfolio).forEach(sym => {
        if (portfolio[sym].totalUnits > 0) {
            const currentPrice = (window.currentPrices && window.currentPrices[sym]) ? Number(window.currentPrices[sym]) : portfolio[sym].avgPrice;
            const marketValue = portfolio[sym].totalUnits * currentPrice;
            unrealizedPnL[sym] = marketValue - portfolio[sym].totalCost;
        }
    });

    // ----------------------------
 // ----------------------------
// คำนวณ Unrealized ราย Sector
// ----------------------------
sectorUnrealizedPnL = {};

Object.keys(portfolio).forEach(sym => {

    if (portfolio[sym].totalUnits <= 0) return;

    const trade = globalTradesData.find(
        t => String(t.symbol).trim().toUpperCase() === sym
    );

    if (!trade) return;

    const sec = trade.sector || "อื่นๆ";

    if (!sectorUnrealizedPnL[sec]) {
        sectorUnrealizedPnL[sec] = 0;
    }

    sectorUnrealizedPnL[sec] += unrealizedPnL[sym] || 0;
});

    let netDeposited = 0;
    globalTradesData.forEach(t => {
        if (t.type === 'ฝากเงิน') netDeposited += parseFloat(t.netAmount);
        else if (t.type === 'ถอนเงิน') netDeposited -= parseFloat(t.netAmount);
    });

    // สรุป Dashboard
    Object.keys(portfolio).forEach(sym => {
        if (portfolio[sym].totalUnits > 0) {
            activeStocksCount++;
            let marketPrice = window.currentPrices[sym] || portfolio[sym].avgPrice;
            let marketValue = portfolio[sym].totalUnits * marketPrice;
            totalPortfolioValue += marketValue;
        }
        totalPnL += realizedPnL[sym] + (unrealizedPnL[sym] || 0);
    });

    document.getElementById('dashTotalValue').innerText = totalPortfolioValue.toLocaleString(undefined, { maximumFractionDigits: 0 });
    document.getElementById('dashTotalPnL').innerText = (totalPnL >= 0 ? '+' : '') + totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2 });
    document.getElementById('dashTotalStocks').innerText = activeStocksCount;
    document.getElementById('dashTotalTrades').innerText = globalTradesData.length;

    // 3. Render ตารางประวัติ
    globalTradesData.slice(-displayCount).reverse().forEach(trade => {
        const gross = Number(trade.grossAmount) || 0;
const fee = Number(trade.feeTax) || 0;

const feeRate = gross > 0
    ? (fee / gross) * 100
    : 0;
        const row = document.createElement('tr');
        row.innerHTML = `<td>${new Date(trade.date).toLocaleDateString('en-CA')}</td><td class="${trade.type === 'ซื้อ' ? 'type-buy' : 'type-sell'}">${trade.type}</td><td class="fw-bold">${trade.symbol}</td><td>${trade.sector || '-'}</td><td>${trade.broker || '-'}</td>
        <td>${parseFloat(trade.price).toLocaleString()}</td><td>${parseInt(trade.units).toLocaleString()}</td>
        <td>${parseFloat(trade.grossAmount).toLocaleString()}</td>
        <td>${fee.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}
    <br>
    <small class="text-muted">${feeRate.toFixed(4)}%</small>
</td><td class="fw-bold">${parseFloat(trade.netAmount).toLocaleString()}</td><td>-</td><td><button class="btn-action-edit" onclick="startEditMode(${trade.rowIndex})">✏️</button> <button class="btn-delete" onclick="deleteRecord(${trade.rowIndex}, '${trade.symbol}', ${trade.units})">🗑️</button></td>`;
        tbodyRecord.appendChild(row);
    });

    if (displayCount < globalTradesData.length) {
        const loadMoreRow = document.createElement('tr');
        loadMoreRow.innerHTML = `<td colspan="12"><button class="btn w-100" onclick="loadMore()">ดูรายการก่อนหน้าเพิ่มเติม...</button></td>`;
        tbodyRecord.appendChild(loadMoreRow);
    }

    // 4. Render Monitor Table ตาม View ที่เลือก (stock หรือ sector)
    const dataMap = (currentMonitorView === 'stock') ? portfolio : sectorPortfolio;
    const pnLMap = (currentMonitorView === 'stock') ? realizedPnL : sectorPnL;

    renderMonitorTable(dataMap, pnLMap);
    drawAllocationChart(currentMonitorView);
    renderDividendTable();
    renderDividendHistory();
    renderDividendKPI();
    
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
        const feeTax = parseFloat(document.getElementById('feeRate').value) || 0;
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
        if (dataMap[key].totalUnits > 0) {
            let value = 0;
            if (view === "stock") {
                let price = window.currentPrices[key] || 0;
                value = dataMap[key].totalUnits * price;
            } else {
                value = dataMap[key].totalCost;
            }
            labels.push(key);
            values.push(value);
        }
    });

    const canvas = document.getElementById("allocationChart");
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
            plugins: {
                legend: {
                    position: "bottom"
                },
                tooltip: {
                    callbacks: {
                        label: function (ctx) {
                            let total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                            let percent = total > 0 ? (ctx.raw / total * 100).toFixed(2) : 0;
                            return ctx.label + " " + percent + "%";
                        }
                    }
                }
            }
        }
    });
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

    dividendData[sym].items.forEach(item => {

        const d = new Date(item.date);

        if (year && d.getFullYear() !== year) return;
        if (month && (d.getMonth() + 1) !== month) return;

        count++;
        amount += item.amount;
        dpu += item.dpu;
        cost += item.cost;

    });

    return {

        count,

        amount,

        dpu: count ? dpu / count : 0,

        cost,

        yield: cost ? (amount / cost) * 100 : 0

    };

}

function renderDividendTable() {
    const tbody = document.getElementById("dividendTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    const year = Number(document.getElementById("dividendYear").value);
    const month = Number(document.getElementById("dividendMonth").value);

    let result = {};
    let total = 0;
    let allTotal = 0;
    let allCount = 0;
    let allStock = {};

    globalTradesData.forEach(t => {
        if (String(t.type).trim() !== "ปันผล") return;

        const amount = Number(t.netAmount) || 0;

        allTotal += amount;
        allCount++;
        allStock[String(t.symbol).toUpperCase()] = true;

        const d = new Date(t.date);

        if (year > 0 && d.getFullYear() !== year) return;
        if (month > 0 && (d.getMonth() + 1) !== month) return;

        const sym = String(t.symbol).toUpperCase();

        if (!result[sym]) {
            result[sym] = {
                count: 0,
                amount: 0,
                dpu: 0
            };
        }

        result[sym].count++;
        result[sym].amount += amount;
        result[sym].dpu += Number(t.price) || 0;

        total += amount;
    });

    document.getElementById("dividendSelectedTotal").innerText =
        total.toLocaleString(undefined, { minimumFractionDigits: 2 });

    document.getElementById("dividendAllTotal").innerText =
        allTotal.toLocaleString(undefined, { minimumFractionDigits: 2 });

    document.getElementById("dividendStockCount").innerText =
        Object.keys(allStock).length;

    document.getElementById("dividendCount").innerText =
        allCount;

    document.getElementById("dividendYearTotal").innerText =
        total.toLocaleString(undefined, { minimumFractionDigits: 2 });

    document.getElementById("dividendGrowth").innerText =
    calculateDividendGrowth() + "%";
    
document.getElementById("dividendAvgMonth").innerText =
    calculateAverageDividendMonth()
    .toLocaleString(undefined,{
        minimumFractionDigits:2
    }) + " บาท";
    
const top = calculateTopDividendStock();


document.getElementById("dividendTopStock").innerText =
    top.symbol;


document.getElementById("dividendTopAmount").innerText =
    top.amount.toLocaleString(undefined,{
        minimumFractionDigits:2
    }) + " บาท";


document.getElementById("dividendTopPercent").innerText =
    top.percent + "% ของ Dividend ทั้งหมด";
    

    // สร้างข้อมูลก่อน เพื่อเอาไปเรียง
    let rows = Object.keys(result).map(sym => {
        const info = getDividendSummary(sym, year, month);

        return {
            symbol: sym,
            count: info.count,
            dpu: info.dpu,
            amount: info.amount,
            cost: info.cost,
            yield: info.yield
        };
    });

    // อ่านค่าจาก Dropdown
    const sortType = document.getElementById("dividendSort").value;

    // เรียงข้อมูล
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

    // แสดงตารางหลังเรียงแล้ว
    rows.forEach(item => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${item.symbol}</td>
            <td>${item.count}</td>
            <td>${item.dpu.toFixed(2)}</td>
            <td>${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            <td>${item.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            <td>${item.yield.toFixed(2)}%</td>
        `;

        tbody.appendChild(row);
    });

    // หากต้องการเปิดใช้กราฟภายหลัง สามารถปลดคอมเมนต์ด้านล่างนี้ได้ครับ
    if (typeof renderDividendMonthlyChart === 'function') renderDividendMonthlyChart();
    if (typeof renderDividendStockChart === 'function') renderDividendStockChart();
    if (typeof renderDividendStockChart === 'function') renderDividendYearChart();
    
    
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

    // รีเซ็ตสีปุ่ม
    document.getElementById("tabPortfolioBtn").classList.remove("active");
    document.getElementById("tabDividendBtn").classList.remove("active");
    document.getElementById("tabSettingsBtn").classList.remove("active");
    document.getElementById("tabAnalyticsBtn").classList.remove("active");

    // แสดงหน้าที่เลือก
    if (tab === "portfolio") {
        document.getElementById("portfolioTab").style.display = "block";
        document.getElementById("tabPortfolioBtn").classList.add("active");
    }

if (tab === "dividend") {

    document.getElementById("dividendTab").style.display = "block";
    document.getElementById("tabDividendBtn").classList.add("active");

    buildDividendYear();
    buildCalendarYear();

    renderDividendTable();
    renderDividendCalendar();
    renderDividendKPI();

}
    
    if (tab === "settings") {
        document.getElementById("settingsTab").style.display = "block";
        document.getElementById("tabSettingsBtn").classList.add("active");
    }
    
    if (tab === "analytics") {
        document.getElementById("analyticsTab").style.display = "block";
        document.getElementById("tabAnalyticsBtn").classList.add("active");
    }
}

function renderDividendHistory() {
    const historyTbody = document.getElementById("dividendHistoryBody");
    if (!historyTbody) return;

    let html = "";
    const historyData = globalTradesData.filter(t => String(t.type).trim() === "ปันผล");

    historyData
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, dividendHistoryLimit)
    .forEach(t => {
        html += `
        <tr>
            <td>${new Date(t.date).toLocaleDateString("th-TH")}</td>
            <td>${t.symbol}</td>
            <td>${t.sector}</td>
            <td class="text-end">
                ${Number(t.netAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </td>
        </tr>
        `;
    });

    historyTbody.innerHTML = html;
    
    const btn = document.getElementById("btnShowAllDividend");

if(btn){

    btn.style.display =
        historyData.length > 10
        ? "inline-block"
        : "none";

}
}

function showAllDividendHistory(){

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
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "right"
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
// --- สั่งเริ่มทำงานเมื่อเปิดหน้าเว็บ ---
window.onload = function() {
    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }
    initConnection();
};



