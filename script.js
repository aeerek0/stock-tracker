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
let dynamicSectorMap = {}; 
let sectorDividendData = {};

// --- Master Data ---
const masterSectorMap = {
    "BA": "Transport", "BCH": "Health Care", "BDMS": "Health Care", "BGRIM": "Energy",
    "CENTEL": "Tourism", "CPALL": "Commerce", "CPN": "Property", "EPG": "Property & Construction",
    "EA": "Energy", "HMPRO": "Commerce", "LH": "Property", "MC": "Fashion", "MINT": "Tourism",
    "SABINA": "Fashion", "SAT": "Automotive", "SPALI": "Property", "TIPH": "Insurance",
    "TISCO": "Banking", "TLI": "Insurance", "TU": "Food & Bev", "WHA": "Property (Indus)","TRUE": "Telecommunications"
};

const masterBrokerList = ["Finansia", "Yuanta", "Pi"];

// --- 1. Connection & Initialization ---
function initConnection() {
    const savedUrl = localStorage.getItem('user_google_sheet_url');
    const statusEl = document.getElementById('connectionStatus');
    const inputEl = document.getElementById('sheetUrlInput');

    if (savedUrl) {
        WEB_APP_URL = savedUrl;
        if (inputEl) inputEl.value = savedUrl;

        if (statusEl) {
            statusEl.innerHTML = "🟡 สถานะ: กำลังเชื่อมต่อ...";
            statusEl.className = "d-block mt-2 fw-bold text-warning";
        }

        if (typeof buildStockDropdown === 'function') buildStockDropdown();
        if (typeof buildBrokerDropdown === 'function') buildBrokerDropdown();

        fetch(WEB_APP_URL)
            .then(response => {
                if (!response.ok) throw new Error("Connection Error");
                return response.json();
            })
            .then(data => {
                globalTradesData = data.trades || [];
                window.currentPrices = data.prices || {};

                if (statusEl) {
                    statusEl.innerHTML = `🟢 สถานะ: เชื่อมต่อ Google Sheet สำเร็จ (${globalTradesData.length} รายการ)`;
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
    const url = urlInput ? urlInput.value.trim() : "";

    if (url === "") {
        alert("กรุณาใส่ Web App URL");
        return;
    }

    localStorage.setItem('user_google_sheet_url', url);
    WEB_APP_URL = url;
    initConnection();
};

// Event Dynamic Form Type UI Toggle
const typeElement = document.getElementById('type');
if (typeElement) {
    typeElement.addEventListener('change', function () {
        const type = this.value;
        const amountContainer = document.getElementById('amountContainer');
        const symbolGroup = document.getElementById('symbol')?.parentElement;
        const sectorGroup = document.getElementById('sector')?.parentElement;
        const brokerGroup = document.getElementById('broker')?.parentElement;
        const priceGroup = document.getElementById('price')?.parentElement;
        const unitsGroup = document.getElementById('units')?.parentElement;
        const feeGroup = document.getElementById('feeRate')?.parentElement;

        if(!symbolGroup) return;

        // Reset visibility
        symbolGroup.style.display = "";
        sectorGroup.style.display = "";
        brokerGroup.style.display = "";
        priceGroup.style.display = "";
        unitsGroup.style.display = "";
        feeGroup.style.display = "";
        if (amountContainer) amountContainer.style.display = "none";

        if (type === "ฝากเงิน" || type === "ถอนเงิน") {
            if (amountContainer) amountContainer.style.display = "block";
            symbolGroup.style.display = "none";
            sectorGroup.style.display = "none";
            brokerGroup.style.display = "none";
            priceGroup.style.display = "none";
            unitsGroup.style.display = "none";
            feeGroup.style.display = "none";
        } else if (type === "ปันผล") {
            if (amountContainer) amountContainer.style.display = "block";
            symbolGroup.style.display = "";
            sectorGroup.style.display = "";
            brokerGroup.style.display = "";
            priceGroup.style.display = "";
            unitsGroup.style.display = "";
            feeGroup.style.display = "none";
        }
    });
}

// --- Helper Functions ---
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

function autoFillSector(symbolValue) {
    if (!symbolValue) return;
    const sym = String(symbolValue).trim().toUpperCase();
    const symbolInput = document.getElementById('symbol');
    const sectorInput = document.getElementById('sector');

    if (symbolInput) symbolInput.value = sym; 
    if (!sectorInput) return;

    if (masterSectorMap[sym]) {
        sectorInput.value = masterSectorMap[sym];
    } else if (dynamicSectorMap[sym]) {
        sectorInput.value = dynamicSectorMap[sym];
    }
}

function updateMonitor(view) {
    currentMonitorView = view;
    const dataMap = (view === 'stock') ? portfolio : sectorPortfolio;
    const pnLMap = (view === 'stock') ? realizedPnL : sectorPnL;

    renderMonitorTable(dataMap, pnLMap);
    if (typeof drawAllocationChart === 'function') drawAllocationChart(view);
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

function fetchAndRenderData() {
    if (!WEB_APP_URL) {
        alert("ยังไม่ได้กำหนด WEB_APP_URL");
        return;
    }

    const monitorBody = document.getElementById('monitorTableBody');
    const tradeBody = document.getElementById('tradeTableBody');

    if (monitorBody) monitorBody.innerHTML = `<tr><td colspan="10" class="text-center">กำลังโหลดพอร์ตของคุณ...</td></tr>`;
    if (tradeBody) tradeBody.innerHTML = `<tr><td colspan="12" class="text-center">กำลังโหลดประวัติ...</td></tr>`;

    fetch(WEB_APP_URL)
        .then(response => response.json())
        .then(data => {
            globalTradesData = data.trades || [];
            window.currentPrices = data.prices || {};
            dynamicSectorMap = {};

            globalTradesData.forEach(t => {
                if (t.symbol && t.sector) {
                    dynamicSectorMap[t.symbol.trim().toUpperCase()] = t.sector;
                }
            });

            renderPortfolioAndRecords(globalTradesData);
            if (typeof buildDividendYear === 'function') buildDividendYear();
            if (typeof buildCalendarYear === 'function') buildCalendarYear();
        })
        .catch(error => {
            console.error("Refresh Error:", error);
            if (monitorBody) monitorBody.innerHTML = `<tr><td colspan="10" class="text-danger text-center">โหลดข้อมูลล้มเหลว</td></tr>`;
            if (tradeBody) tradeBody.innerHTML = `<tr><td colspan="12" class="text-danger text-center">โหลดข้อมูลล้มเหลว</td></tr>`;
        });
}

// --- Main Core: Portfolio Calculation & Render ---
function renderPortfolioAndRecords(trades = globalTradesData) {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = "";

    // Reset Core State
    portfolio = {};
    sectorPortfolio = {};
    realizedPnL = {};
    unrealizedPnL = {};
    sectorPnL = {};
    sectorUnrealizedPnL = {};
    dividendData = {};
    dividendCostBasis = {};
    sectorDividendData = {};

    const symbolSectorMap = {};
    let totalPortfolioValue = 0;
    let totalRealizedPnL = 0;
    let activeStocksCount = 0;
    let cashBalance = 0;
    totalDividend = 0;

    // 1. Sort Trades Chronologically
    const sortedTrades = [...trades].sort((a, b) => new Date(a.date) - new Date(b.date));

    // 2. Pass 1: Process All Cashflow & Trades
    sortedTrades.forEach(trade => {
        const sym = String(trade.symbol || "").trim().toUpperCase();
        const sector = String(trade.sector || "อื่นๆ").trim();
        const amount = Number(trade.netAmount) || 0;
        const units = parseInt(trade.units) || 0;

        if (sym && sector && sector !== "อื่นๆ") {
            symbolSectorMap[sym] = sector;
        }

        if (trade.type === 'ฝากเงิน') {
            cashBalance += amount;
            return;
        }
        if (trade.type === 'ถอนเงิน') {
            cashBalance -= amount;
            return;
        }

        if (trade.type === 'ปันผล') {
            totalDividend += amount;
            if (!dividendData[sym]) {
                dividendData[sym] = { count: 0, amount: 0, items: [], totalCost: 0 };
            }
            dividendData[sym].count++;
            dividendData[sym].amount += amount;

            const costAtDividend = portfolio[sym] ? portfolio[sym].totalCost : 0;
            dividendData[sym].totalCost += costAtDividend;

            dividendData[sym].items.push({
                date: trade.date,
                amount: amount,
                dpu: Number(trade.price) || 0,
                units: units,
                cost: costAtDividend
            });

            const symSector = symbolSectorMap[sym] || sector;
            sectorDividendData[symSector] = (sectorDividendData[symSector] || 0) + amount;
            return;
        }

        if (!portfolio[sym]) {
            portfolio[sym] = { totalUnits: 0, totalCost: 0, avgPrice: 0 };
            realizedPnL[sym] = 0;
        }
        if (!sectorPortfolio[sector]) {
            sectorPortfolio[sector] = { totalUnits: 0, totalCost: 0, avgPrice: 0 };
            sectorPnL[sector] = 0;
        }

        if (trade.type === 'ซื้อ') {
            cashBalance -= amount;
            portfolio[sym].totalUnits += units;
            portfolio[sym].totalCost += amount;
            portfolio[sym].avgPrice = portfolio[sym].totalUnits > 0 ? portfolio[sym].totalCost / portfolio[sym].totalUnits : 0;

            sectorPortfolio[sector].totalUnits += units;
            sectorPortfolio[sector].totalCost += amount;
            sectorPortfolio[sector].avgPrice = sectorPortfolio[sector].totalUnits > 0 ? sectorPortfolio[sector].totalCost / sectorPortfolio[sector].totalUnits : 0;
        } else if (trade.type === 'ขาย') {
            cashBalance += amount;
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

    // 3. Pass 2: Calculate Market Value & Unrealized PnL
    Object.keys(portfolio).forEach(sym => {
        if (portfolio[sym].totalUnits > 0) {
            const currentPrice = (window.currentPrices && window.currentPrices[sym]) ? Number(window.currentPrices[sym]) : portfolio[sym].avgPrice;
            const marketValue = portfolio[sym].totalUnits * currentPrice;
            const unPnL = marketValue - portfolio[sym].totalCost;

            unrealizedPnL[sym] = unPnL;
            const sec = symbolSectorMap[sym] || "อื่นๆ";
            sectorUnrealizedPnL[sec] = (sectorUnrealizedPnL[sec] || 0) + unPnL;

            activeStocksCount++;
            totalPortfolioValue += marketValue;
        }
        totalRealizedPnL += realizedPnL[sym];
    });

    // 4. Update Dashboard Cards UI
    const totalUnrealized = Object.values(unrealizedPnL).reduce((sum, val) => sum + val, 0);
    const totalHoldingCost = Object.values(portfolio).reduce((sum, stock) => sum + (stock.totalUnits > 0 ? stock.totalCost : 0), 0);
    const totalPnL = totalRealizedPnL + totalUnrealized;
    const growthPercent = totalHoldingCost > 0 ? (totalUnrealized / totalHoldingCost) * 100 : 0;
    const netWorth = totalPortfolioValue + cashBalance;

    const setElementText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.innerText = text;
    };
    const setElementColor = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.style.color = val >= 0 ? "#4faba2" : "#e56b6f";
    };

    setElementText('dashTotalValue', totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    setElementText('dashTotalPnL', (totalPnL >= 0 ? '+' : '') + totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    setElementText('dashGrowth', `Unrealized ${growthPercent >= 0 ? '+' : ''}${growthPercent.toFixed(2)}%`);
    setElementText('dashUnrealizedPnL', (totalUnrealized >= 0 ? '+' : '') + totalUnrealized.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    setElementText('dashTotalStocks', activeStocksCount);
    setElementText('dashDividend', totalDividend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    setElementText('dashCashBalance', cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    setElementText('dashNetWorth', netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

    setElementColor('dashGrowth', growthPercent);
    setElementColor('dashTotalPnL', totalPnL);
    setElementColor('dashUnrealizedPnL', totalUnrealized);

    // 5. Render Trade History Table
    const tbodyRecord = document.getElementById('tradeTableBody');
    if (tbodyRecord) {
        tbodyRecord.innerHTML = '';
        trades.slice(-displayCount).reverse().forEach(trade => {
            const gross = Number(trade.grossAmount) || 0;
            const fee = Number(trade.feeTax) || 0;
            const feeRate = gross > 0 ? (fee / gross) * 100 : 0;
            const dateStr = trade.date ? trade.date.split("T")[0] : "-";

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${dateStr}</td>
                <td class="${trade.type === 'ซื้อ' ? 'type-buy' : trade.type === 'ขาย' ? 'type-sell' : ''}">${trade.type}</td>
                <td class="fw-bold">${trade.symbol || '-'}</td>
                <td>${trade.sector || '-'}</td>
                <td>${trade.broker || '-'}</td>
                <td>${parseFloat(trade.price || 0).toLocaleString()}</td>
                <td>${parseInt(trade.units || 0).toLocaleString()}</td>
                <td>${parseFloat(trade.grossAmount || 0).toLocaleString()}</td>
                <td>
                    ${fee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<br>
                    <small class="text-muted">${feeRate.toFixed(4)}%</small>
                </td>
                <td class="fw-bold">${parseFloat(trade.netAmount || 0).toLocaleString()}</td>
                <td>-</td>
                <td>
                    <button class="btn-action-edit btn btn-sm btn-outline-primary" onclick="startEditMode(${trade.rowIndex})">✏️</button>
                    <button class="btn-delete btn btn-sm btn-outline-danger" onclick="deleteRecord(${trade.rowIndex}, '${trade.symbol}', ${trade.units})">🗑️</button>
                </td>`;
            tbodyRecord.appendChild(row);
        });

        if (displayCount < trades.length) {
            const loadMoreRow = document.createElement('tr');
            loadMoreRow.innerHTML = `<td colspan="12"><button class="btn btn-light w-100 fw-bold" onclick="loadMore()">ดูรายการก่อนหน้าเพิ่มเติม...</button></td>`;
            tbodyRecord.appendChild(loadMoreRow);
        }
    }

    // 6. Sub-components Render
    const dataMap = (currentMonitorView === 'stock') ? portfolio : sectorPortfolio;
    const pnLMap = (currentMonitorView === 'stock') ? realizedPnL : sectorPnL;

    renderMonitorTable(dataMap, pnLMap);
    if (typeof drawAllocationChart === 'function') drawAllocationChart(currentMonitorView);
    if (typeof renderDividendTable === 'function') renderDividendTable();
    if (typeof renderDividendHistory === 'function') renderDividendHistory();
    if (typeof renderDividendKPI === 'function') renderDividendKPI();
}

function loadMore() {
    displayCount += 20;
    renderPortfolioAndRecords(globalTradesData);
}

// --- Search Handler ---
function searchTrades() {
    const inputEl = document.getElementById("searchInput");
    if (!inputEl) return;
    const input = inputEl.value.toUpperCase().trim();
    
    if (input === "") {
        renderPortfolioAndRecords(globalTradesData);
        return;
    }

    const filteredData = globalTradesData.filter(trade => {
        const dateStr = trade.date ? String(trade.date).split("T")[0] : "";
        const sym = String(trade.symbol || "").toUpperCase();
        return sym.includes(input) || dateStr.includes(input);
    });

    renderTableOnly(filteredData);
}

function renderTableOnly(data) {
    const tbodyRecord = document.getElementById('tradeTableBody');
    if (!tbodyRecord) return;
    tbodyRecord.innerHTML = '';
    
    data.slice().reverse().forEach(trade => {
        const gross = Number(trade.grossAmount) || 0;
        const fee = Number(trade.feeTax) || 0;
        const feeRate = gross > 0 ? (fee / gross) * 100 : 0;
        const dateStr = trade.date ? trade.date.split("T")[0] : "-";

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${dateStr}</td>
            <td class="${trade.type === 'ซื้อ' ? 'type-buy' : trade.type === 'ขาย' ? 'type-sell' : ''}">${trade.type}</td>
            <td class="fw-bold">${trade.symbol || '-'}</td>
            <td>${trade.sector || '-'}</td>
            <td>${trade.broker || '-'}</td>
            <td>${parseFloat(trade.price || 0).toLocaleString()}</td>
            <td>${parseInt(trade.units || 0).toLocaleString()}</td>
            <td>${parseFloat(trade.grossAmount || 0).toLocaleString()}</td>
            <td>
                ${fee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<br>
                <small class="text-muted">${feeRate.toFixed(4)}%</small>
            </td>
            <td class="fw-bold">${parseFloat(trade.netAmount || 0).toLocaleString()}</td>
            <td>-</td>
            <td>
                <button class="btn-action-edit btn btn-sm btn-outline-primary" onclick="startEditMode(${trade.rowIndex})">✏️</button>
                <button class="btn-delete btn btn-sm btn-outline-danger" onclick="deleteRecord(${trade.rowIndex}, '${trade.symbol}', ${trade.units})">🗑️</button>
            </td>`;
        tbodyRecord.appendChild(row);
    });
}

// --- Edit & Delete Actions ---
function startEditMode(rowIndex) {
    const trade = globalTradesData.find(t => t.rowIndex == rowIndex);
    if (!trade) return;

    let dateVal = trade.date || "";
    if (dateVal.includes("T")) dateVal = dateVal.split("T")[0];
    
    document.getElementById('editRowIndex').value = trade.rowIndex;
    document.getElementById('date').value = dateVal;
    
    const typeEl = document.getElementById('type');
    typeEl.value = trade.type;
    typeEl.dispatchEvent(new Event('change')); // Dispatch change to handle input field toggles

    document.getElementById('symbol').value = trade.symbol || '';
    document.getElementById('sector').value = trade.sector || '';
    document.getElementById('broker').value = trade.broker || '';
    document.getElementById('price').value = trade.price || 0;
    document.getElementById('units').value = trade.units || 0;
    document.getElementById('feeRate').value = Number(trade.feeTax || 0).toFixed(2);
    
    const amountEl = document.getElementById('amount');
    if (amountEl) amountEl.value = trade.netAmount || 0;

    document.getElementById('formTitle').innerText = "✏️ แก้ไขข้อมูลรายการ";
    const alertEl = document.getElementById('editAlert');
    if (alertEl) alertEl.style.display = "block";

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.innerText = "🆙 อัปเดตข้อมูลไปยัง Google Sheets";
    submitBtn.style.backgroundColor = "var(--pastel-edit, #ffb703)";
    
    document.getElementById('tradeForm').scrollIntoView({ behavior: 'smooth' });
}

// --- Render Monitor Table ---

function renderMonitorTable(dataMap, pnLMap, sortedKeys = null) {
    const mBody = document.getElementById('monitorTableBody');
    if (!mBody) return;
    mBody.innerHTML = '';

    const header = document.getElementById('monitorSymbolHeader');
    if (header) {
        header.innerText = currentMonitorView === "stock" ? "Symbol" : "Sector";
    }

    // กำหนดค่าเริ่มต้นข้อมูลป้องกัน undefined
    const safeDataMap = dataMap || {};
    const keys = sortedKeys || Object.keys(safeDataMap);
    let totalValue = 0;

    // 1. คำนวณมูลค่าพอร์ตรวม
    keys.forEach(key => {
        const data = safeDataMap[key];
        if (!data || data.totalUnits <= 0) return;

        let marketValue = 0;

        if (currentMonitorView === "stock") {
            const currentPrices = window.currentPrices || {};
            let marketPrice = Number(currentPrices[key]) || data.avgPrice;
            marketValue = data.totalUnits * marketPrice;
        } else {
            const portfolio = window.portfolio || {};
            const globalTradesData = window.globalTradesData || [];

            Object.keys(portfolio).forEach(sym => {
                const trade = globalTradesData.find(
                    t => String(t.symbol).trim().toUpperCase() === sym
                );
                if (!trade) return;

                const sec = trade.sector || "อื่นๆ";
                if (sec === key) {
                    const currentPrices = window.currentPrices || {};
                    const price = Number(currentPrices[sym]) || portfolio[sym].avgPrice;
                    marketValue += portfolio[sym].totalUnits * price;
                }
            });
        }

        totalValue += marketValue;
    });

    // 2. วาดตารางข้อมูล
    keys.forEach(key => {
        const data = safeDataMap[key];
        if (!data || data.totalUnits <= 0) return;

        let marketPrice = data.avgPrice;
        let marketValue = 0;
        const portfolio = window.portfolio || {};
        const globalTradesData = window.globalTradesData || [];

        if (currentMonitorView === "stock") {
            const currentPrices = window.currentPrices || {};
            marketPrice = Number(currentPrices[key]) || data.avgPrice;
            marketValue = data.totalUnits * marketPrice;
        } else {
            marketPrice = 0;
            Object.keys(portfolio).forEach(sym => {
                const trade = globalTradesData.find(
                    t => String(t.symbol).trim().toUpperCase() === sym
                );
                if (!trade) return;

                const sec = trade.sector || "อื่นๆ";
                if (sec === key) {
                    const currentPrices = window.currentPrices || {};
                    const price = Number(currentPrices[sym]) || portfolio[sym].avgPrice;
                    marketValue += portfolio[sym].totalUnits * price;
                }
            });
        }

        // ดึงค่า PnL
        let totalPnL = 0;
        if (currentMonitorView === "stock") {
            const unrealizedPnL = window.unrealizedPnL || {};
            totalPnL = unrealizedPnL[key] || 0;
        } else {
            const sectorUnrealizedPnL = window.sectorUnrealizedPnL || {};
            totalPnL = sectorUnrealizedPnL[key] || 0;
        }

        const roi = data.totalCost > 0 ? (totalPnL / data.totalCost) * 100 : 0;
        const weight = totalValue > 0 ? (marketValue / totalValue) * 100 : 0;

        // คำนวณ Dividend Yield
        let dividendReceived = 0;

        if (currentMonitorView === "stock") {
            globalTradesData.forEach(trade => {
                if (
                    trade.type === "ปันผล" &&
                    String(trade.symbol).trim().toUpperCase() === key
                ) {
                    dividendReceived += Number(trade.netAmount || 0);
                }
            });
        } else {
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

        // สร้างแถวตาราง HTML
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="fw-bold">${key}</td>
            <td>${data.totalUnits.toLocaleString()}</td>
            <td>${currentMonitorView === "stock" ? data.avgPrice.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "-"}</td>
            <td>${data.totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
            <td>${currentMonitorView === "stock" ? marketPrice.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "-"}</td>
            <td>${marketValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
            <td class="text-secondary fw-bold">${weight.toFixed(1)}%</td>
            <td class="${totalPnL >= 0 ? 'text-success' : 'text-danger'}">${totalPnL.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
            <td class="${roi >= 0 ? 'text-success' : 'text-danger'}">${roi.toFixed(2)}%</td>
            <td class="text-primary fw-bold">
                ${currentMonitorView === "sector" && dividendReceived === 0 ? "-" : dividendYield.toFixed(2) + "%"}
            </td>
        `;
        mBody.appendChild(row);
    });
}

function cancelEditMode() {
    document.getElementById('editRowIndex').value = "";
    document.getElementById('tradeForm').reset();
    document.getElementById('date').valueAsDate = new Date();
    document.getElementById('feeRate').value = "0.0";

    document.getElementById('formTitle').innerText = "➕ บันทึกรายการใหม่";
    const alertEl = document.getElementById('editAlert');
    if (alertEl) alertEl.style.display = "none";

    const btn = document.getElementById('submitBtn');
    btn.disabled = false;
    btn.innerText = "💾 บันทึกส่งไปยัง Google Sheets";
    btn.style.backgroundColor = "var(--pastel-orange-dark, #fb8500)";

    // Trigger form visibility reset
    const typeEl = document.getElementById('type');
    if (typeEl) typeEl.dispatchEvent(new Event('change'));
}

function deleteRecord(rowIndex, symbol, units) {
    if (!confirm(`คุณต้องการลบรายการหุ้น ${symbol || ''} จำนวน ${(units || 0).toLocaleString()} หุ้น ใช่หรือไม่?`)) {
        return;
    }

    const tradeBody = document.getElementById('tradeTableBody');
    if (tradeBody) tradeBody.innerHTML = `<tr><td colspan="12" class="text-center text-danger font-weight-bold">⏳ กำลังลบข้อมูล...</td></tr>`;

    fetch(WEB_APP_URL, {
        method: "POST",
        cache: "no-cache",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "delete", rowIndex: rowIndex })
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

// --- Form Submit Handler ---
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
        let netAmount = 0;

        if (type === 'ฝากเงิน' || type === 'ถอนเงิน' || type === 'ปันผล') {
            const amountInput = document.getElementById('amount');
            netAmount = parseFloat(amountInput ? amountInput.value : 0) || 0;
        } else {
            netAmount = type === 'ซื้อ' ? grossAmount + feeTax : grossAmount - feeTax;
        }

        const isCash = type === 'ฝากเงิน' || type === 'ถอนเงิน';

        const tradeData = {
            action: editRowIndex !== "" ? "edit" : "insert",
            rowIndex: editRowIndex,
            date: document.getElementById('date').value,
            type: type,
            symbol: document.getElementById('symbol').value.trim().toUpperCase(),
            sector: isCash ? 'Cash Management' : document.getElementById('sector').value,
            broker: document.getElementById('broker').value.trim(),
            price: (type === 'ซื้อ' || type === 'ขาย' || type === 'ปันผล') ? price : 0,
            units: (type === 'ซื้อ' || type === 'ขาย' || type === 'ปันผล') ? units : 0,
            grossAmount: (type === 'ซื้อ' || type === 'ขาย' || type === 'ปันผล') ? grossAmount.toFixed(2) : 0,
            feeTax: (type === 'ซื้อ' || type === 'ขาย') ? feeTax.toFixed(2) : 0,
            netAmount: netAmount.toFixed(2)
        };

        fetch(WEB_APP_URL, {
            method: "POST",
            cache: "no-cache",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(tradeData)
        })
        .then(response => response.json())
        .then(result => {
            if (result.status === "success") {
                alert(editRowIndex !== "" ? "อัปเดตข้อมูลสำเร็จ!" : "บันทึกข้อมูลสำเร็จ!");
                cancelEditMode();
                fetchAndRenderData();
            } else {
                submitBtn.disabled = false;
                submitBtn.innerText = "💾 บันทึกส่งไปยัง Google Sheets";
                alert("เกิดข้อผิดพลาดในการบันทึก");
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

// --- 1. Draw Allocation Chart (Doughnut) ---
function drawAllocationChart(view = "stock") {
    const dataMap = view === "stock" ? portfolio : sectorPortfolio;
    const labels = [];
    const values = [];

    if (!dataMap) return;

    Object.keys(dataMap).forEach(key => {
        const item = dataMap[key];
        const hasUnits = item.totalUnits > 0;
        const hasValue = view === "sector" && (item.totalMarketValue > 0 || item.totalCost > 0);

        if (hasUnits || hasValue) {
            let value = 0;
            if (view === "stock") {
                let price = window.currentPrices?.[key] || 0;
                value = item.totalUnits * price;
            } else {
                value = item.totalMarketValue || item.totalCost || 0;
            }

            if (value > 0) {
                labels.push(key);
                values.push(value);
            }
        }
    });

    const canvas = document.getElementById("allocationChart");
    if (!canvas) return;

    if (window.allocationChart && typeof window.allocationChart.destroy === "function") {
        window.allocationChart.destroy();
    }

    if (values.length === 0) return;

    const totalSum = values.reduce((a, b) => a + b, 0);

    const chartColors = [
        "#4faba2", "#e56b6f", "#f7b801", "#3a86ff", "#8338ec", 
        "#ff006e", "#fb5607", "#06d6a0", "#118ab2", "#073b4c"
    ];

    const pluginsList = (typeof ChartDataLabels !== 'undefined') ? [ChartDataLabels] : [];

    window.allocationChart = new Chart(canvas, {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: chartColors.slice(0, labels.length)
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        generateLabels: function(chart) {
                            const data = chart.data;
                            const dataset = data.datasets[0];

                            return data.labels.map((label, i) => {
                                const value = dataset.data[i] || 0;
                                const percent = totalSum > 0 ? (value / totalSum * 100).toFixed(1) : "0.0";
                                const color = dataset.backgroundColor[i] || "#ccc";

                                return {
                                    text: `${label} (${percent}%)`,
                                    fillStyle: color,
                                    strokeStyle: color,
                                    lineWidth: 0,
                                    index: i
                                };
                            });
                        }
                    }
                },
                datalabels: {
                    color: "#ffffff",
                    font: {
                        weight: "bold",
                        size: 12
                    },
                    formatter: function(value) {
                        if (!totalSum || totalSum === 0) return "";
                        const pct = (value / totalSum * 100).toFixed(1);
                        return pct > 3 ? pct + "%" : "";
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(ctx) {
                            const val = ctx.raw || 0;
                            const percent = totalSum > 0 ? (val / totalSum * 100).toFixed(2) : "0.00";
                            const formattedVal = val.toLocaleString(undefined, { minimumFractionDigits: 2 });
                            return ` ${ctx.label}: ฿${formattedVal} (${percent}%)`;
                        }
                    }
                }
            }
        },
        plugins: pluginsList
    });
}

// --- 2. Build Dropdown Years for Dividends ---
function buildDividendYear() {
    const yearSelect = document.getElementById("dividendYear");
    if (!yearSelect) return;

    yearSelect.innerHTML = `<option value="0">ทุกปี</option>`;

    let years = [];
    (globalTradesData || []).forEach(t => {
        if (String(t.type).trim() === "ปันผล") {
            let date = new Date(t.date);
            if (!isNaN(date.getTime())) {
                let year = date.getFullYear();
                if (!years.includes(year)) {
                    years.push(year);
                }
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
}

function buildCalendarYear() {
    const select = document.getElementById("calendarYear");
    if (!select) return;

    select.innerHTML = `<option value="0">ทุกปี</option>`;

    let years = [];
    (globalTradesData || []).forEach(t => {
        if (String(t.type).trim() !== "ปันผล") return;
        const d = new Date(t.date);
        if (!isNaN(d.getTime())) {
            const y = d.getFullYear();
            if (!years.includes(y)) {
                years.push(y);
            }
        }
    });

    years.sort((a, b) => b - a);

    years.forEach(y => {
        const option = document.createElement("option");
        option.value = y;
        option.text = y;
        select.appendChild(option);
    });
}

// --- 3. Dividend Calculation Helpers ---
function getDividendSummary(sym, year = 0, month = 0) {
    if (!dividendData || !dividendData[sym]) {
        return { count: 0, amount: 0, dpu: 0, cost: 0, yield: 0 };
    }

    let count = 0;
    let amount = 0;
    let dpu = 0;
    let cost = 0;

    dividendData[sym].items.forEach(item => {
        const d = new Date(item.date);
        if (isNaN(d.getTime())) return;

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

// Fallback Helper Functions (ป้องกัน Crash หากไม่ได้จำกัดความไว้ที่อื่น)
function calculateDividendGrowth() {
    return 0.0; 
}
function calculateAverageDividendMonth() {
    return 0.0;
}
function calculateTopDividendStock() {
    return { symbol: "-", amount: 0, percent: 0 };
}

// --- 4. Render Dividend Summary Table ---
function renderDividendTable() {
    const tbody = document.getElementById("dividendTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    const yearEl = document.getElementById("dividendYear");
    const monthEl = document.getElementById("dividendMonth");
    const year = yearEl ? Number(yearEl.value) : 0;
    const month = monthEl ? Number(monthEl.value) : 0;

    let result = {};
    let total = 0;
    let allTotal = 0;
    let allCount = 0;
    let allStock = {};

    (globalTradesData || []).forEach(t => {
        if (String(t.type).trim() !== "ปันผล") return;

        const amount = Number(t.netAmount) || 0;

        allTotal += amount;
        allCount++;
        allStock[String(t.symbol).toUpperCase()] = true;

        const d = new Date(t.date);
        if (isNaN(d.getTime())) return;

        if (year > 0 && d.getFullYear() !== year) return;
        if (month > 0 && (d.getMonth() + 1) !== month) return;

        const sym = String(t.symbol).toUpperCase();

        if (!result[sym]) {
            result[sym] = { count: 0, amount: 0, dpu: 0 };
        }

        result[sym].count++;
        result[sym].amount += amount;
        result[sym].dpu += Number(t.price) || 0;

        total += amount;
    });

    // Helper ในการอัปเดต Element ปลอดภัยขึ้น
    const setSafeText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.innerText = text;
    };

    setSafeText("dividendSelectedTotal", total.toLocaleString(undefined, { minimumFractionDigits: 2 }));
    setSafeText("dividendAllTotal", allTotal.toLocaleString(undefined, { minimumFractionDigits: 2 }));
    setSafeText("dividendStockCount", Object.keys(allStock).length);
    setSafeText("dividendCount", allCount);
    setSafeText("dividendYearTotal", total.toLocaleString(undefined, { minimumFractionDigits: 2 }));

    const growthVal = typeof calculateDividendGrowth === 'function' ? calculateDividendGrowth() : 0;
    setSafeText("dividendGrowth", growthVal + "%");

    const avgMonthVal = typeof calculateAverageDividendMonth === 'function' ? calculateAverageDividendMonth() : 0;
    setSafeText("dividendAvgMonth", avgMonthVal.toLocaleString(undefined, { minimumFractionDigits: 2 }) + " บาท");

    const top = typeof calculateTopDividendStock === 'function' ? calculateTopDividendStock() : { symbol: "-", amount: 0, percent: 0 };
    setSafeText("dividendTopStock", top.symbol);
    setSafeText("dividendTopAmount", top.amount.toLocaleString(undefined, { minimumFractionDigits: 2 }) + " บาท");
    setSafeText("dividendTopPercent", top.percent + "% ของ Dividend ทั้งหมด");

    // เตรียม Rows สำหรับแสดงผลและเรียงลำดับ
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

    const sortEl = document.getElementById("dividendSort");
    const sortType = sortEl ? sortEl.value : "amount";

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
                return b.amount - a.amount;
        }
    });

    rows.forEach(item => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td class="fw-bold">${item.symbol}</td>
            <td>${item.count}</td>
            <td>${item.dpu.toFixed(2)}</td>
            <td class="text-success fw-bold">${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            <td>${item.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            <td>${item.yield.toFixed(2)}%</td>
        `;

        tbody.appendChild(row);
    });

    // เรียก Render Chart ย่อยตามเงื่อนไขความพร้อมของฟังก์ชัน
    if (typeof renderDividendMonthlyChart === 'function') renderDividendMonthlyChart();
    if (typeof renderDividendStockChart === 'function') renderDividendStockChart();
    if (typeof renderDividendYearChart === 'function') renderDividendYearChart();
}
// --- Global State Variables for Dividend History ---
let dividendHistoryLimit = 10;
let showAllDividend = false;

// --- 1. Render Dividend KPI ---
function renderDividendKPI() {
    let yearTotal = {};
    let stockTotal = {};
    let monthTotal = {};

    let totalDividend = 0;

    (globalTradesData || []).forEach(t => {
        if (String(t.type).trim() !== "ปันผล") return;

        const amount = Number(t.netAmount) || 0;
        const d = new Date(t.date);
        if (isNaN(d.getTime())) return;

        // ปี
        const year = d.getFullYear();
        yearTotal[year] = (yearTotal[year] || 0) + amount;

        // หุ้น
        const sym = String(t.symbol).trim().toUpperCase();
        stockTotal[sym] = (stockTotal[sym] || 0) + amount;

        // เดือน
        const month = d.getMonth() + 1;
        monthTotal[month] = (monthTotal[month] || 0) + amount;

        totalDividend += amount;
    });

    // ปีล่าสุด
    const years = Object.keys(yearTotal).sort((a, b) => b - a);
    const latestYear = years[0];

    const setSafeText = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.innerText = val;
    };

    setSafeText(
        "dividendLatestYear",
        latestYear
            ? yearTotal[latestYear].toLocaleString(undefined, { minimumFractionDigits: 2 })
            : "0.00"
    );

    // หุ้นสูงสุด
    let topStock = "-";
    let maxStock = 0;

    Object.keys(stockTotal).forEach(sym => {
        if (stockTotal[sym] > maxStock) {
            maxStock = stockTotal[sym];
            topStock = sym;
        }
    });

    setSafeText("dividendTopStock", topStock);

    // เดือนสูงสุด
    let topMonth = "-";
    let maxMonth = 0;

    Object.keys(monthTotal).forEach(m => {
        if (monthTotal[m] > maxMonth) {
            maxMonth = monthTotal[m];
            topMonth = m;
        }
    });

    const monthName = [
        "", "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", 
        "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", 
        "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];

    setSafeText("dividendTopMonth", topMonth !== "-" ? monthName[topMonth] : "-");

    // Yield รวม
    let totalCost = 0;
    let totalAmount = 0;

    if (typeof dividendData !== 'undefined' && dividendData) {
        Object.keys(dividendData).forEach(sym => {
            if (typeof getDividendSummary === 'function') {
                const info = getDividendSummary(sym);
                totalAmount += info.amount || 0;
                totalCost += info.cost || 0;
            }
        });
    }

    const yieldTotal = totalCost > 0 ? (totalAmount / totalCost) * 100 : 0;
    setSafeText("dividendTotalYield", yieldTotal.toFixed(2) + "%");
}

// --- 2. Tab Navigation System ---
function switchTab(tab) {
    const tabs = ["portfolio", "dividend", "settings", "analytics"];

    // ซ่อนทุกหน้า และ รีเซ็ตปุ่ม
    tabs.forEach(t => {
        const tabEl = document.getElementById(`${t}Tab`);
        const btnEl = document.getElementById(`tab${t.charAt(0).toUpperCase() + t.slice(1)}Btn`);

        if (tabEl) tabEl.style.display = "none";
        if (btnEl) btnEl.classList.remove("active");
    });

    // แสดงหน้าที่เลือก
    const activeTabEl = document.getElementById(`${tab}Tab`);
    const activeBtnEl = document.getElementById(`tab${tab.charAt(0).toUpperCase() + tab.slice(1)}Btn`);

    if (activeTabEl) activeTabEl.style.display = "block";
    if (activeBtnEl) activeBtnEl.classList.add("active");

    // โหลดข้อมูลตาม Tab ที่เปิด
    if (tab === "dividend") {
        if (typeof buildDividendYear === 'function') buildDividendYear();
        if (typeof buildCalendarYear === 'function') buildCalendarYear();
        if (typeof renderDividendTable === 'function') renderDividendTable();

        renderDividendCalendar();
        renderDividendKPI();
        renderDividendHistory();
    }
}

// --- 3. Dividend History Table & Toggle ---
function renderDividendHistory() {
    const historyTbody = document.getElementById("dividendHistoryBody");
    if (!historyTbody) return;

    let html = "";
    const historyData = (globalTradesData || []).filter(t => String(t.type).trim() === "ปันผล");

    historyData
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, dividendHistoryLimit)
        .forEach(t => {
            const d = new Date(t.date);
            const dateStr = !isNaN(d.getTime()) ? d.toLocaleDateString("th-TH") : "-";

            html += `
            <tr>
                <td>${dateStr}</td>
                <td class="fw-bold">${t.symbol || "-"}</td>
                <td>${t.sector || "-"}</td>
                <td class="text-end text-success fw-bold">
                    ${Number(t.netAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
            </tr>
            `;
        });

    historyTbody.innerHTML = html;

    const btn = document.getElementById("btnShowAllDividend");
    if (btn) {
        btn.style.display = historyData.length > 10 ? "inline-block" : "none";
    }
}

function showAllDividendHistory() {
    dividendHistoryLimit = 999999;
    renderDividendHistory();

    const btn = document.getElementById("btnShowAllDividend");
    if (btn) btn.style.display = "none";
}

function toggleDividendHistory() {
    showAllDividend = !showAllDividend;
    dividendHistoryLimit = showAllDividend ? 999999 : 10;

    const btn = document.getElementById("btnShowAllDividend");
    if (btn) {
        btn.innerText = showAllDividend ? "🔼 ย่อ" : "📄 ดูทั้งหมด";
    }

    renderDividendHistory();
}

// --- 4. Dividend Calendar & Detail Toggle ---
function toggleDividendDetail(monthIndex) {
    const previewEl = document.getElementById(`dividend-preview-${monthIndex}`);
    const detailEl = document.getElementById(`dividend-detail-${monthIndex}`);
    const btnEl = document.getElementById(`dividend-btn-${monthIndex}`);

    if (!detailEl) return;

    if (detailEl.style.display === "none") {
        detailEl.style.display = "block";
        if (previewEl) previewEl.style.display = "none";
        if (btnEl) btnEl.innerHTML = "🔽 ซ่อนรายการ";
    } else {
        detailEl.style.display = "none";
        if (previewEl) previewEl.style.display = "block";
        if (btnEl) btnEl.innerHTML = `👁 ดูทั้งหมด`;
    }
}

function renderDividendCalendar() {
    const container = document.getElementById("dividendCalendar");
    if (!container) return;

    container.innerHTML = "";

    const yearSelect = document.getElementById("calendarYear");
    const year = yearSelect ? Number(yearSelect.value) : 0;

    const months = [
        "🌸 มกราคม", "❤️ กุมภาพันธ์", "🌿 มีนาคม", "🌼 เมษายน",
        "🌻 พฤษภาคม", "☀️ มิถุนายน", "🏖️ กรกฎาคม", "🍂 สิงหาคม",
        "🍁 กันยายน", "🎃 ตุลาคม", "❄️ พฤศจิกายน", "🎄 ธันวาคม"
    ];

    let monthData = {};
    for (let i = 1; i <= 12; i++) {
        monthData[i] = { total: 0, items: [] };
    }

    (globalTradesData || []).forEach(t => {
        if (String(t.type).trim() !== "ปันผล") return;

        const d = new Date(t.date);
        if (isNaN(d.getTime())) return;
        if (year > 0 && d.getFullYear() !== year) return;

        const m = d.getMonth() + 1;
        const amount = Number(t.netAmount) || 0;

        monthData[m].items.push({
            symbol: t.symbol,
            amount: amount
        });

        monthData[m].total += amount;
    });

    for (let i = 1; i <= 12; i++) {
        const data = monthData[i];

        let html = `
        <div class="col-12 col-md-6 col-lg-4 mb-3">
            <div class="calendar-card p-3 border rounded ${data.items.length > 0 ? "has-dividend" : "no-dividend"}">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <div class="calendar-title fw-bold">${months[i - 1]}</div>
                    <div class="calendar-total text-success fw-bold">฿${data.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                </div>
        `;

        if (data.items.length === 0) {
            html += `
                <div class="calendar-empty text-muted small">ไม่มีปันผล</div>
            `;
        } else {
            data.items.sort((a, b) => b.amount - a.amount);
            const companyCount = new Set(data.items.map(item => item.symbol)).size;

            html += `
                <div class="text-muted small mb-2">🏢 ${companyCount} บริษัท</div>
                <div id="dividend-preview-${i}">
            `;

            data.items.slice(0, 3).forEach(item => {
                html += `
                <div class="calendar-item d-flex justify-content-between small border-bottom py-1">
                    <span>${item.symbol}</span>
                    <span class="fw-bold">฿${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                `;
            });

            html += `</div>`;

            if (data.items.length > 3) {
                html += `
                <div class="calendar-more text-primary small mt-2 cursor-pointer"
                     id="dividend-btn-${i}"
                     style="cursor: pointer;"
                     onclick="toggleDividendDetail(${i})">
                    👁 ดูทั้งหมด ${data.items.length} รายการ
                </div>
                <div id="dividend-detail-${i}" style="display:none;" class="mt-2">
                `;

                data.items.forEach(item => {
                    html += `
                    <div class="calendar-item d-flex justify-content-between small border-bottom py-1">
                        <span>${item.symbol}</span>
                        <span class="fw-bold">฿${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    `;
                });

                html += `</div>`;
            }
        }

        html += `
            </div>
        </div>
        `;

        container.innerHTML += html;
    }
}
// --- 1. Bootstrap Modal Handler ---
function showDividendDetail(month, items = [], total = 0) {
    const titleEl = document.getElementById("dividendModalTitle");
    const bodyEl = document.getElementById("dividendModalBody");
    const modalEl = document.getElementById("dividendDetailModal");

    if (titleEl) titleEl.innerText = month;

    let html = "";
    items.forEach(item => {
        html += `
        <div class="d-flex justify-content-between align-items-center mb-2 border-bottom pb-1">
            <span class="fw-bold">${item.symbol || "-"}</span>
            <span class="text-success fw-bold">${Number(item.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} บาท</span>
        </div>
        `;
    });

    html += `
    <hr class="my-2">
    <div class="text-end fw-bold fs-6">
        รวมทั้งหมด <span class="text-primary">${Number(total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span> บาท
    </div>
    `;

    if (bodyEl) bodyEl.innerHTML = html;

    if (modalEl && typeof bootstrap !== 'undefined') {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }
}

// --- 2. Dividend Charts (Chart.js) ---

// 2.1 Monthly Dividend Chart (Bar)
function renderDividendMonthlyChart() {
    const yearEl = document.getElementById("dividendYear");
    const year = yearEl ? Number(yearEl.value) : 0;

    let monthly = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    (globalTradesData || []).forEach(t => {
        if (String(t.type).trim() !== "ปันผล") return;

        const d = new Date(t.date);
        if (isNaN(d.getTime())) return;
        if (year > 0 && d.getFullYear() !== year) return;

        const month = d.getMonth();
        monthly[month] += Number(t.netAmount) || 0;
    });

    const ctx = document.getElementById("dividendMonthlyChart");
    if (!ctx) return;

    if (window.dividendMonthlyChart && typeof window.dividendMonthlyChart.destroy === "function") {
        window.dividendMonthlyChart.destroy();
    }

    window.dividendMonthlyChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."],
            datasets: [{
                label: "Dividend (บาท)",
                data: monthly,
                backgroundColor: "#4faba2"
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

// 2.2 Stock Dividend Distribution Chart (Doughnut)
function renderDividendStockChart() {
    const yearEl = document.getElementById("dividendYear");
    const year = yearEl ? Number(yearEl.value) : 0;

    let stockData = {};

    (globalTradesData || []).forEach(t => {
        if (String(t.type).trim() !== "ปันผล") return;

        const d = new Date(t.date);
        if (isNaN(d.getTime())) return;
        if (year > 0 && d.getFullYear() !== year) return;

        const sym = String(t.symbol).trim().toUpperCase();
        stockData[sym] = (stockData[sym] || 0) + (Number(t.netAmount) || 0);
    });

    const labels = Object.keys(stockData);
    const values = Object.values(stockData);

    const ctx = document.getElementById("dividendStockChart");
    if (!ctx) return;

    if (window.dividendStockChart && typeof window.dividendStockChart.destroy === "function") {
        window.dividendStockChart.destroy();
    }

    window.dividendStockChart = new Chart(ctx, {
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

// 2.3 Yearly Dividend Chart (Bar - พ.ศ.)
function renderDividendYearChart() {
    let yearData = {};

    (globalTradesData || []).forEach(t => {
        if (String(t.type).trim() !== "ปันผล") return;

        const d = new Date(t.date);
        if (isNaN(d.getTime())) return;

        const year = d.getFullYear() + 543; // แปลงเป็น พ.ศ.
        yearData[year] = (yearData[year] || 0) + (Number(t.netAmount) || 0);
    });

    const labels = Object.keys(yearData).sort((a, b) => a - b);
    const values = labels.map(y => yearData[y]);

    const ctx = document.getElementById("dividendYearChart");
    if (!ctx) return;

    if (window.dividendYearChart && typeof window.dividendYearChart.destroy === "function") {
        window.dividendYearChart.destroy();
    }

    window.dividendYearChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Dividend (บาท)",
                data: values,
                backgroundColor: "#3a86ff"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false
        }
    });
}

// --- 3. Calculation & Helper Functions ---

function calculateDividendGrowth() {
    let yearly = {};

    (globalTradesData || []).forEach(t => {
        if (String(t.type).trim() !== "ปันผล") return;

        const d = new Date(t.date);
        if (isNaN(d.getTime())) return;

        const year = d.getFullYear();
        yearly[year] = (yearly[year] || 0) + (Number(t.netAmount) || 0);
    });

    const years = Object.keys(yearly).sort((a, b) => b - a);

    if (years.length < 2) return "0.00";

    const latest = yearly[years[0]];
    const previous = yearly[years[1]];

    if (previous === 0) return "0.00";

    return (((latest - previous) / previous) * 100).toFixed(2);
}

function calculateTopDividendStock() {
    let stock = {};

    (globalTradesData || []).forEach(t => {
        if (String(t.type).trim() !== "ปันผล") return;

        const sym = String(t.symbol).trim().toUpperCase();
        stock[sym] = (stock[sym] || 0) + (Number(t.netAmount) || 0);
    });

    let maxStock = "-";
    let maxAmount = 0;

    Object.keys(stock).forEach(sym => {
        if (stock[sym] > maxAmount) {
            maxAmount = stock[sym];
            maxStock = sym;
        }
    });

    const total = Object.values(stock).reduce((a, b) => a + b, 0);
    const percent = total > 0 ? ((maxAmount / total) * 100).toFixed(2) : "0.00";

    return {
        symbol: maxStock,
        amount: maxAmount,
        percent: percent
    };
}

function calculateAverageDividendMonth() {
    let total = 0;
    let monthSet = new Set();

    (globalTradesData || []).forEach(t => {
        if (String(t.type).trim() !== "ปันผล") return;

        const d = new Date(t.date);
        if (isNaN(d.getTime())) return;

        total += Number(t.netAmount) || 0;
        monthSet.add(`${d.getFullYear()}-${d.getMonth()}`);
    });

    // เฉลี่ยตามจำนวนเดือนที่มีข้อมูลรับปันผลจริง (หากไม่มีให้ใช้ 12 เดือน)
    const activeMonths = monthSet.size > 0 ? monthSet.size : 12;
    return total / activeMonths;
}

function toggleDividendDetail(month) {
    const preview = document.getElementById("dividend-preview-" + month);
    const detail = document.getElementById("dividend-detail-" + month);
    const btn = document.getElementById("dividend-btn-" + month);

    if (!preview || !detail || !btn) return;

    if (detail.style.display === "none") {
        preview.style.display = "none";
        detail.style.display = "block";
        btn.innerHTML = "▲ ซ่อนรายการ";
    } else {
        preview.style.display = "block";
        detail.style.display = "none";
        const itemCount = detail.children.length;
        btn.innerHTML = `👁 ดูทั้งหมด ${itemCount} รายการ`;
    }
}

// --- 4. Entry Point & Initialization ---
window.onload = function() {
    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }
    if (typeof initConnection === 'function') {
        initConnection();
    }
};
