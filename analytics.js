let WEB_APP_URL = "";
let trades = [];
let monthChart = null;
let buySellChart = null;
let showAllClosed = false;

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
pnlSelect.innerHTML =
    `<option value="">ทุกปี</option>`;

list.forEach(y => {
    pnlSelect.innerHTML +=
        `<option value="${y}">${y}</option>`;
});
    }

    if (buySellSelect) {
buySellSelect.innerHTML =
    `<option value="">ทุกปี</option>`;

list.forEach(y => {
    buySellSelect.innerHTML +=
        `<option value="${y}">${y}</option>`;
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
        renderTradingHighlights();
        renderClosedPosition();

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

    // ลบกราฟเก่าก่อน
    if (monthChart) {
        monthChart.destroy();
    }

    monthChart = new Chart(chartElement, {
        type: "bar",
        data: {
            labels: Object.keys(data).map(m => {

    const monthNames = [
        "ม.ค.","ก.พ.","มี.ค.","เม.ย.",
        "พ.ค.","มิ.ย.","ก.ค.","ส.ค.",
        "ก.ย.","ต.ค.","พ.ย.","ธ.ค."
    ];

    return monthNames[Number(m.substring(5,7)) - 1];

}),
datasets: [{
    label: "กำไร / ขาดทุน",
    data: Object.values(data),

    backgroundColor: Object.values(data).map(v =>
        v >= 0 ? "#4CAF50" : "#E74C3C"
    ),

    borderColor: Object.values(data).map(v =>
        v >= 0 ? "#388E3C" : "#C62828"
    ),

    borderWidth: 1
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

    if (buySellChart) {
    buySellChart.destroy();
}


    buySellChart = new Chart(chartElement, {
        type: "bar",
        data: {
          labels: labels.map(m => {

    const monthNames = [
        "ม.ค.","ก.พ.","มี.ค.","เม.ย.",
        "พ.ค.","มิ.ย.","ก.ค.","ส.ค.",
        "ก.ย.","ต.ค.","พ.ย.","ธ.ค."
    ];

    return monthNames[Number(m.substring(5,7)) - 1];

}),
            datasets: [
{
    label: "ซื้อ",
    data: labels.map(x => monthly[x].buy),
    backgroundColor: "#4CAF50",
    borderColor: "#388E3C",
    borderWidth: 1
},
{
    label: "ขาย",
    data: labels.map(x => monthly[x].sell),
    backgroundColor: "#FF9800",
    borderColor: "#F57C00",
    borderWidth: 1
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

// ==========================
// Trading Highlights
// ==========================

function renderTradingHighlights(){
  

    let portfolio = {};
    let bestTrade = null;
    let worstTrade = null;

    let holdingData = {};


    trades.forEach(t=>{

        const sym = String(t.symbol || "").trim().toUpperCase();

        if(!sym) return;


        const units = Number(t.units) || 0;
        const net = Number(t.netAmount) || 0;


        // =================
        // ซื้อ
        // =================

        if(t.type === "ซื้อ"){

            if(!portfolio[sym]){
                portfolio[sym] = [];
            }


            portfolio[sym].push({

                date:new Date(t.date),
                units:units,
                cost:net

            });


        }


        // =================
        // ขาย
        // =================

        if(t.type === "ขาย"){

            if(!portfolio[sym]) return;


            let sellUnits = units;


            while(sellUnits > 0 && portfolio[sym].length){

                let buy = portfolio[sym][0];


                let useUnits = Math.min(
                    sellUnits,
                    buy.units
                );


                let avgCost =
                    buy.cost / buy.units;


                let pnl =
                    (net / units * useUnits)
                    -
                    (avgCost * useUnits);



                // Best Trade

                if(!bestTrade || pnl > bestTrade.pnl){

                    bestTrade = {
                        symbol:sym,
                        pnl:pnl
                    };

                }


                // Worst Trade

                if(!worstTrade || pnl < worstTrade.pnl){

                    worstTrade = {
                        symbol:sym,
                        pnl:pnl
                    };

                }


                // Holding Day

                let sellDate = new Date(t.date);

                let days =
                    Math.floor(
                        (sellDate - buy.date)
                        /
                        (1000*60*60*24)
                    );


                if(!holdingData[sym]){
                    holdingData[sym]={
                        total:0,
                        count:0
                    };
                }


                holdingData[sym].total += days;
                holdingData[sym].count++;


                buy.units -= useUnits;
                sellUnits -= useUnits;


                if(buy.units <=0){

                    portfolio[sym].shift();

                }

            }

        }


    });



    // =====================
    // Average Holding
    // =====================

    let totalDays = 0;
    let totalCount = 0;


    Object.values(holdingData)
    .forEach(x=>{

        totalDays += x.total;
        totalCount += x.count;

    });


    let avgHolding =
        totalCount > 0
        ?
        totalDays / totalCount
        :
        0;



    // =====================
    // Update HTML
    // =====================


    if(document.getElementById("bestTradeSymbol")){

        document.getElementById("bestTradeSymbol").innerHTML =
            bestTrade
            ?
            bestTrade.symbol
            :
            "-";

    }


    if(document.getElementById("bestTradeValue")){

        document.getElementById("bestTradeValue").innerHTML =
            bestTrade
            ?
            "+"+
            bestTrade.pnl.toLocaleString(undefined,{
                maximumFractionDigits:2
            })
            :
            "-";

    }



    if(document.getElementById("worstTradeSymbol")){

        document.getElementById("worstTradeSymbol").innerHTML =
            worstTrade
            ?
            worstTrade.symbol
            :
            "-";

    }


    if(document.getElementById("worstTradeValue")){

        document.getElementById("worstTradeValue").innerHTML =
            worstTrade
            ?
            worstTrade.pnl.toLocaleString(undefined,{
                maximumFractionDigits:2
            })
            :
            "-";

    }



    if(document.getElementById("avgHoldingDays")){

        document.getElementById("avgHoldingDays").innerHTML =
            avgHolding.toFixed(0);

    }


}

function renderClosedPosition(){
    let closedSummary = {

    count:0,
    realized:0,
    dividend:0,
    total:0,
    returnTotal:0

};

    const tbody = document.getElementById("closedPositionTableBody");

    if(!tbody) return;

    tbody.innerHTML = "";


    let data = {};


    trades.forEach(t=>{

        const sym = t.symbol;

        if(!sym) return;


        if(!data[sym]){
data[sym] = {

    qty:0,
    cost:0,
    totalCost:0,
    realized:0,
    dividend:0,
    lastSell:""

};

        }


        const units = Number(t.units) || 0;
        const amount = Number(t.netAmount) || 0;


        // ซื้อ
if(t.type === "ซื้อ"){

    data[sym].qty += units;

    data[sym].cost += amount;

    data[sym].totalCost += amount;

}


        // ขาย
        if(t.type === "ขาย"){

            let avgCost =
                data[sym].qty > 0
                ? data[sym].cost / data[sym].qty
                : 0;


            let soldCost =
                avgCost * units;


            let profit =
                amount - soldCost;


            data[sym].realized += profit;


            data[sym].qty -= units;


            data[sym].cost -= soldCost;


            data[sym].lastSell = t.date;

        }


        // ปันผล
        if(t.type === "ปันผล"){

            data[sym].dividend += amount;

        }


    });



    let rows = [];


    Object.keys(data).forEach(sym=>{

        let s = data[sym];


        // ยังถืออยู่ ไม่ใช่ Closed
        if(s.qty > 0) return;


        let totalReturn =
            s.realized + s.dividend;


let returnPercent =
    s.totalCost > 0
    ? (totalReturn / s.totalCost) * 100
    : 0;

// Closed Summary
closedSummary.count++;

closedSummary.realized += s.realized;

closedSummary.dividend += s.dividend;

closedSummary.total += totalReturn;

closedSummary.returnTotal += returnPercent;


rows.push({

    sym:sym,
    date:s.lastSell,
    realized:s.realized,
    dividend:s.dividend,
    totalReturn:totalReturn,
    returnPercent:returnPercent

});
        

}); 
rows.sort((a,b)=>
    new Date(b.date || "1900-01-01") -
    new Date(a.date || "1900-01-01")
);


    // แสดงปุ่มเฉพาะเมื่อเกิน 10 รายการ
const toggleBtn = document.getElementById("toggleClosedBtn");

if(toggleBtn){

    if(rows.length > 10){

        toggleBtn.style.display = "inline-block";

        toggleBtn.innerHTML = showAllClosed
            ? "▲ ซ่อน"
            : "▼ ดูทั้งหมด (" + rows.length + ")";

    }else{

        toggleBtn.style.display = "none";

    }

}


// จำนวนที่จะแสดง
const displayRows = showAllClosed
    ? rows
    : rows.slice(0,10);


displayRows.forEach(r=>{


        tbody.innerHTML += `

        <tr>

            <td>${r.sym}</td>

            <td>${r.date || "-"}</td>


            <td class="${r.realized>=0?'text-success':'text-danger'}">

            ${r.realized.toLocaleString(undefined,{
                minimumFractionDigits:2
            })}

            </td>

<td>

${
    r.dividend > 0
    ? r.dividend.toLocaleString(undefined,{
        minimumFractionDigits:2
      })
    : "-"
}

</td>


            <td class="${r.totalReturn>=0?'text-success':'text-danger'}">

            ${r.totalReturn.toLocaleString(undefined,{
                minimumFractionDigits:2
            })}

            </td>


            <td class="${r.returnPercent>=0?'text-success':'text-danger'}">

            ${(r.returnPercent>=0?'+':'')+
            r.returnPercent.toFixed(2)}%

            </td>


        </tr>

        `;


    });
// ==========================
// Render Closed Summary
// ==========================

const avgReturn =
    closedSummary.count > 0
    ? closedSummary.returnTotal / closedSummary.count
    : 0;


const closedCountEl = document.getElementById("closedSummaryCount");
const closedRealizedEl = document.getElementById("closedSummaryRealized");
const closedDividendEl = document.getElementById("closedSummaryDividend");
const closedTotalEl = document.getElementById("closedSummaryTotal");
const closedAvgReturnEl = document.getElementById("closedSummaryAvgReturn");


if(closedCountEl)
    closedCountEl.innerText = closedSummary.count;


if(closedRealizedEl)
    closedRealizedEl.innerText =
        "+" + closedSummary.realized.toLocaleString(undefined,{
            minimumFractionDigits:2
        });


if(closedDividendEl)
    closedDividendEl.innerText =
        "+" + closedSummary.dividend.toLocaleString(undefined,{
            minimumFractionDigits:2
        });


if(closedTotalEl)
    closedTotalEl.innerText =
        "+" + closedSummary.total.toLocaleString(undefined,{
            minimumFractionDigits:2
        });


if(closedAvgReturnEl)
    closedAvgReturnEl.innerText =
        "+" + avgReturn.toFixed(2) + "%";
}

function toggleClosedTable(){

    showAllClosed = !showAllClosed;

    renderClosedPosition();

}

window.onload = function () {
    loadAnalytics();
};
