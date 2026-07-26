let WEB_APP_URL = "";
let trades = [];
let monthChart = null;
let buySellChart = null;

function buildAnalyticsYear() {

    let years = new Set();

    trades.forEach(t => {
        if (t.date) {
            years.add(t.date.substring(0, 4));
        }
    });

    let list = [...years].sort().reverse(); // ปีล่าสุดอยู่บนสุด

    const pnlSelect = document.getElementById("pnlYearSelect");
    const buySellSelect = document.getElementById("buySellYearSelect");

    if (pnlSelect) {
        pnlSelect.innerHTML = "";

        list.forEach(y => {
            pnlSelect.innerHTML += `<option value="${y}">${y}</option>`;
        });
    }

    if (buySellSelect) {
        buySellSelect.innerHTML = "";

        list.forEach(y => {
            buySellSelect.innerHTML += `<option value="${y}">${y}</option>`;
        });
    }
}

function loadAnalytics() {

    WEB_APP_URL = localStorage.getItem("user_google_sheet_url");

    console.log("URL =", WEB_APP_URL);

    if (!WEB_APP_URL) {
        alert("ยังไม่ได้เชื่อม Google Sheet");
        return;
    }

    fetch(WEB_APP_URL + "?t=" + Date.now())
    .then(response => {

        if (!response.ok) {
            throw new Error("HTTP Error " + response.status);
        }

        return response.json();

    })
    .then(data => {


        if (Array.isArray(data)) {

            trades = data;

        } else if (data.trades && Array.isArray(data.trades)) {

            trades = data.trades;

        } else {

            alert("ข้อมูลไม่ถูกต้อง");
            return;

        }


        // เคลียร์ chart เก่า
        if(monthChart){
            monthChart.destroy();
        }

        if(buySellChart){
            buySellChart.destroy();
        }

        if (Chart.getChart("monthChart")) {
    Chart.getChart("monthChart").destroy();
}

if (Chart.getChart("buySellChart")) {
    Chart.getChart("buySellChart").destroy();
}

        buildAnalyticsYear();
        drawMonthlyPnL();
        drawBuySellMonthly();

        renderTopProfit();
        renderTopLoss();
        renderMostTrade();
        renderSummary();
        renderHoldingPeriod();
        renderSectorPerformance();

    })
.catch(err => {

    console.error("FETCH ERROR:", err);

    alert("โหลดข้อมูลไม่สำเร็จ : " + err.message);

});
}


// โหลดครั้งแรก
window.onload = loadAnalytics;
//==========================
// กำไร/ขาดทุนรายเดือน
//==========================
function drawMonthlyPnL() {
    if (!Array.isArray(trades)) {
        console.warn("drawMonthlyPnL: trades ไม่ใช่ Array", trades);
        return;
    }
    const selectedYear =
    document.getElementById("pnlYearSelect")?.value;

    let portfolio = {};
    let result = {};

    trades.forEach(t => {
        if (t.type === "ฝากเงิน" || t.type === "ถอนเงิน") return;

        const sym = t.symbol;

        if (selectedYear &&
    t.date &&
    t.date.substring(0,4) !== selectedYear)
    return;
        const month = t.date ? t.date.substring(0, 7) : "";
        if (!month) return;

        if (!portfolio[sym]) {
            portfolio[sym] = {
                units: 0,
                cost: 0
            };
        }

        if (!result[month]) result[month] = 0;

        const units = Number(t.units) || 0;
        const net = Number(t.netAmount) || 0;

        if (t.type === "ซื้อ") {
            portfolio[sym].units += units;
            portfolio[sym].cost += net;
        } else if (t.type === "ขาย") {
            if (portfolio[sym].units > 0) {
                const avg = portfolio[sym].cost / portfolio[sym].units;
                const pnl = net - avg * units;

                result[month] += pnl;

                portfolio[sym].units -= units;
                portfolio[sym].cost -= avg * units;
            }
        }
    });

    createChart(result);
}

//==========================
// วาดกราฟ PnL รายเดือน
//==========================
function createChart(data) {
    const chartElement = document.getElementById("monthChart");
    if (!chartElement) return;

    monthChart = new Chart(chartElement, {
        type: "bar",
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: "กำไร / ขาดทุน",
                data: Object.values(data)
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

//==========================
// Top Profit
//==========================
function renderTopProfit() {
    renderPnLTable("topProfitTable", "desc", "text-success");
}

//==========================
// Top Loss
//==========================
function renderTopLoss() {
    renderPnLTable("topLossTable", "asc", "text-danger");
}

//==========================
// ฟังก์ชันคำนวณ PnL
//==========================
function renderPnLTable(tableId, order, colorClass) {
    let portfolio = {};
    let pnl = {};

    trades.forEach(t => {
        if (t.type === "ฝากเงิน" || t.type === "ถอนเงิน") return;

        const sym = t.symbol;
        if (!portfolio[sym]) {
            portfolio[sym] = {
                units: 0,
                cost: 0
            };
            pnl[sym] = 0;
        }

        const units = Number(t.units) || 0;
        const net = Number(t.netAmount) || 0;

        if (t.type === "ซื้อ") {
            portfolio[sym].units += units;
            portfolio[sym].cost += net;
        } else if (t.type === "ขาย") {
            if (portfolio[sym].units > 0) {
                const avg = portfolio[sym].cost / portfolio[sym].units;
                pnl[sym] += net - avg * units;

                portfolio[sym].units -= units;
                portfolio[sym].cost -= avg * units;
            }
        }
    });

let arr = Object.entries(pnl);


// Top Profit เอาเฉพาะกำไรจริง
if (order === "desc") {
    arr = arr.filter(item => item[1] > 0);
}


// Top Loss เอาเฉพาะขาดทุนจริง
if (order === "asc") {
    arr = arr.filter(item => item[1] < 0);
}


arr.sort((a, b) => 
    order === "desc" 
    ? b[1] - a[1] 
    : a[1] - b[1]
);

    let html = "";
    arr.slice(0, 10).forEach(item => {
        html += `
        <tr>
            <td>${item[0]}</td>
            <td class="text-end ${colorClass} fw-bold">
                ${item[1] > 0 ? "+" : ""}${item[1].toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </td>
        </tr>`;
    });

    let tableElement = document.getElementById(tableId);
    if (tableElement) tableElement.innerHTML = html;
}

//==========================
// ซื้อขายบ่อยที่สุด
//==========================
function renderMostTrade() {
    let count = {};

    trades.forEach(t => {
        if (t.type !== "ซื้อ" && t.type !== "ขาย") return;
        const sym = t.symbol;
        if (!count[sym]) count[sym] = 0;
        count[sym]++;
    });

    let html = "";
    Object.entries(count)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(item => {
            html += `
            <tr>
                <td>${item[0]}</td>
                <td class="text-end fw-bold">
                    ${item[1]}
                </td>
            </tr>`;
        });

    let tableElement = document.getElementById("mostTradeTable");
    if (tableElement) tableElement.innerHTML = html;
}

//==========================
// Summary ภาพรวม
//==========================
function renderSummary() {
    let portfolio = {};
    let realized = 0;
    let win = 0;
    let loss = 0;
    let netDeposit = 0;
    let stockResult = {};

    trades.forEach(t => {
        const sym = String(t.symbol || "").trim().toUpperCase();
        const units = Number(t.units) || 0;
        const net = Number(t.netAmount) || 0;

        if (t.type === "ฝากเงิน") {
            netDeposit += net;
            return;
        }

        if (t.type === "ถอนเงิน") {
            netDeposit -= net;
            return;
        }

        if (t.type === "ปันผล") {
            // ถ้าต้องการรวมปันผลเป็นกำไรด้วย ให้เอาออกหรือบวกเพิ่มเข้า realized
            realized += net; 
            return;
        }

        if (!portfolio[sym]) {
            portfolio[sym] = {
                units: 0,
                cost: 0
            };
        }

        // ซื้อ
        if (t.type === "ซื้อ") {
            portfolio[sym].units += units;
            portfolio[sym].cost += net;
        }

        // ขาย
        if (t.type === "ขาย") {
            const p = portfolio[sym];

            if (p.units > 0) {
                // ป้องกันกรณีขายเกินจำนวนที่ถือ หรือปัดเศษ
                const sellUnits = Math.min(units, p.units);
                const avgCost = p.cost / p.units;
                const sellCost = avgCost * sellUnits;
                const pnl = net - sellCost;

                realized += pnl;

                // Trade Win Rate
                if (pnl > 0) win++;
                else if (pnl < 0) loss++;

                // Stock Win Rate Accumulation
                if (!stockResult[sym]) {
                    stockResult[sym] = 0;
                }
                stockResult[sym] += pnl;

                p.units -= sellUnits;
                p.cost -= sellCost;

                // แก้ไขปัญหาเศษทศนิยมค้างเมื่อขายหมดเกลี้ยง
                if (Math.abs(p.units) < 1e-6) {
                    p.units = 0;
                    p.cost = 0;
                }
            }
        }
    });

    // ต้นทุนหุ้นที่ยังถืออยู่
    let currentCost = 0;
    Object.values(portfolio).forEach(p => {
        if (p.units > 0) {
            currentCost += p.cost;
        }
    });

    // อัปเดต DOM
    if (document.getElementById("currentCost")) {
        document.getElementById("currentCost").innerHTML = 
            currentCost.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }

    if (document.getElementById("realizedPnL")) {
        document.getElementById("realizedPnL").innerHTML = 
            realized.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }

    const totalTrade = win + loss;
    const rate = totalTrade > 0 ? (win / totalTrade * 100) : 0;

    if (document.getElementById("winRate")) {
        document.getElementById("winRate").innerHTML = rate.toFixed(2) + "%";
    }

    if (document.getElementById("winDetail")) {
        document.getElementById("winDetail").innerHTML = `${win} ชนะ / ${loss} แพ้`;
    }

    if (document.getElementById("netDeposit")) {
        document.getElementById("netDeposit").innerHTML = 
            netDeposit.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }

    // ======================
    // Stock Win Rate
    // ======================
    let stockWin = 0;
    let stockLoss = 0;

    Object.values(stockResult).forEach(pnl => {
        if (pnl > 0) stockWin++;
        else if (pnl < 0) stockLoss++;
    });

    let stockTotal = stockWin + stockLoss;
    let stockRate = stockTotal > 0 ? (stockWin / stockTotal * 100) : 0;

    if (document.getElementById("stockWinRate")) {
        document.getElementById("stockWinRate").innerHTML = stockRate.toFixed(2) + "%";
    }

    if (document.getElementById("stockWinDetail")) {
        document.getElementById("stockWinDetail").innerHTML = `${stockWin} หุ้นชนะ / ${stockLoss} หุ้นแพ้`;
    }

    // ======================
    // Realized Return (%)
    // ======================
    let returnPercent = netDeposit > 0 ? (realized / netDeposit * 100) : 0;

    if (document.getElementById("realizedReturn")) {
        document.getElementById("realizedReturn").innerHTML = returnPercent.toFixed(2) + "%";
    }
}
//==========================
// Buy / Sell Volume Monthly
//==========================
function drawBuySellMonthly() {
const selectedYear =
    document.getElementById("buySellYearSelect")?.value;
    
    let monthly = {};

    trades.forEach(t => {
        if (t.type !== "ซื้อ" && t.type !== "ขาย") return;

        if (selectedYear &&
    t.date &&
    t.date.substring(0,4) !== selectedYear)
    return;

        let month = t.date ? t.date.substring(0, 7) : "";
        if (!month) return;

        if (!monthly[month]) {
            monthly[month] = {
                buy: 0,
                sell: 0
            };
        }

        let amount = Number(t.netAmount) || 0;

        if (t.type === "ซื้อ") {
            monthly[month].buy += amount;
        } else if (t.type === "ขาย") {
            monthly[month].sell += amount;
        }
    });

    let labels = Object.keys(monthly);
    let chartElement = document.getElementById("buySellChart");
    if (!chartElement) return;

    buySellChart = new Chart(chartElement, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "ซื้อ",
                    data: labels.map(x => monthly[x].buy)
                },
                {
                    label: "ขาย",
                    data: labels.map(x => monthly[x].sell)
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

//==========================
// Holding Period
//==========================
function renderHoldingPeriod() {
    let holdings = {};

    trades.forEach(t => {
        if (t.type !== "ซื้อ" && t.type !== "ขาย") return;

        let sym = t.symbol;
        if (!holdings[sym]) {
            holdings[sym] = [];
        }

        if (t.type === "ซื้อ") {
            holdings[sym].push({
                buyDate: new Date(t.date),
                units: Number(t.units) || 0
            });
        } else if (t.type === "ขาย") {
            let sellDate = new Date(t.date);
            let remain = Number(t.units) || 0;

            while (remain > 0 && holdings[sym].length > 0) {
                let buy = holdings[sym][0];
                let used = Math.min(remain, buy.units);

                let days = Math.floor((sellDate - buy.buyDate) / (1000 * 60 * 60 * 24));

                if (!holdings[sym].periods) {
                    holdings[sym].periods = [];
                }

                holdings[sym].periods.push(days);

                buy.units -= used;
                remain -= used;

                if (buy.units <= 0) {
                    holdings[sym].shift();
                }
            }
        }
    });

    let result = [];
    Object.keys(holdings).forEach(sym => {
        let periods = holdings[sym].periods || [];
        if (periods.length) {
            let avg = periods.reduce((a, b) => a + b, 0) / periods.length;
            result.push([sym, avg]);
        }
    });

    result.sort((a, b) => b[1] - a[1]);

    let html = "";
    result.forEach(r => {
        html += `
        <tr>
            <td>${r[0]}</td>
            <td class="text-end fw-bold">
            ${r[1].toFixed(0)}
            </td>
        </tr>
        `;
    });

    let tableElement = document.getElementById("holdingPeriodTable");
    if (tableElement) tableElement.innerHTML = html;
}

//==========================
// Sector Performance
//==========================
function renderSectorPerformance() {
    let portfolio = {};
    let sectorPnL = {};

    trades.forEach(t => {
        if (t.type !== "ซื้อ" && t.type !== "ขาย") return;

        let sym = t.symbol;
        if (!portfolio[sym]) {
            portfolio[sym] = {
                units: 0,
                cost: 0
            };
        }

        let units = Number(t.units) || 0;
        let net = Number(t.netAmount) || 0;

        if (t.type === "ซื้อ") {
            portfolio[sym].units += units;
            portfolio[sym].cost += net;
        } else if (t.type === "ขาย") {
            if (portfolio[sym].units > 0) {
                let avg = portfolio[sym].cost / portfolio[sym].units;
                let pnl = net - (avg * units);

                let sector = t.sector || "Other";

                if (!sectorPnL[sector]) {
                    sectorPnL[sector] = 0;
                }

                sectorPnL[sector] += pnl;

                portfolio[sym].units -= units;
                portfolio[sym].cost -= avg * units;
            }
        }
    });

    let result = Object.entries(sectorPnL);
    result.sort((a, b) => b[1] - a[1]);

    let html = "";
    result.forEach(r => {
        let cls = r[1] >= 0 ? "text-success" : "text-danger";

        html += `
        <tr>
            <td>${r[0]}</td>
            <td class="text-end fw-bold ${cls}">
            ${r[1].toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </td>
        </tr>
        `;
    });

    let tableElement = document.getElementById("sectorPerformanceTable");
    if (tableElement) tableElement.innerHTML = html;
}

window.onload = function () {
    loadAnalytics();
};
