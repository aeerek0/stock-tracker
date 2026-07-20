let WEB_APP_URL = "";
let trades = [];

window.onload = function () {

    WEB_APP_URL = localStorage.getItem("user_google_sheet_url");

    if (!WEB_APP_URL) {
        alert("ยังไม่ได้เชื่อม Google Sheet");
        return;
    }

    fetch(WEB_APP_URL)
        .then(r => r.json())
        .then(data => {

            trades = data;


            // ===== Analytics =====

            drawMonthlyPnL();

            renderTopProfit();

            renderTopLoss();

            renderMostTrade();

            renderSummary();


        })
        .catch(err => {
            console.error(err);
            alert("โหลดข้อมูลไม่สำเร็จ");
        });

};

//==========================
// กำไร/ขาดทุนรายเดือน
//==========================
function drawMonthlyPnL() {

    let portfolio = {};
    let result = {};

    trades.forEach(t => {

        if (t.type === "ฝากเงิน" || t.type === "ถอนเงิน") return;

        const sym = t.symbol;
        const month = t.date.substring(0, 7);

        if (!portfolio[sym]) {

            portfolio[sym] = {
                units: 0,
                cost: 0
            };

        }

        if (!result[month]) result[month] = 0;

        const units = Number(t.units);
        const net = Number(t.netAmount);

        if (t.type === "ซื้อ") {

            portfolio[sym].units += units;
            portfolio[sym].cost += net;

        } else {

            const avg = portfolio[sym].cost / portfolio[sym].units;

            const pnl = net - avg * units;

            result[month] += pnl;

            portfolio[sym].units -= units;
            portfolio[sym].cost -= avg * units;

        }

    });

    createChart(result);

}

//==========================
// วาดกราฟ
//==========================
function createChart(data) {

    new Chart(document.getElementById("monthChart"), {

        type: "bar",

        data: {

            labels: Object.keys(data),

            datasets: [{

                label: "กำไร / ขาดทุน",

                data: Object.values(data)

            }]

        },

        options: {

            responsive: true

        }

    });

}

//==========================
// Top Profit
//==========================
function renderTopProfit() {

    renderPnLTable(
        "topProfitTable",
        "desc",
        "text-success"
    );

}

//==========================
// Top Loss
//==========================
function renderTopLoss() {

    renderPnLTable(
        "topLossTable",
        "asc",
        "text-danger"
    );

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

        const units = Number(t.units);
        const net = Number(t.netAmount);

        if (t.type === "ซื้อ") {

            portfolio[sym].units += units;
            portfolio[sym].cost += net;

        } else {

            const avg = portfolio[sym].cost / portfolio[sym].units;

            pnl[sym] += net - avg * units;

            portfolio[sym].units -= units;
            portfolio[sym].cost -= avg * units;

        }

    });

    let arr = Object.entries(pnl);

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
                ${item[1].toLocaleString(undefined,{
                    maximumFractionDigits:2
                })}
            </td>
        </tr>`;

    });

    document.getElementById(tableId).innerHTML = html;

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

    document.getElementById("mostTradeTable").innerHTML = html;

}
function renderSummary(){

let portfolio={};

let cost=0;

let realized=0;

let win=0;

let loss=0;



trades.forEach(t=>{


if(
t.type==="ฝากเงิน" ||
t.type==="ถอนเงิน"
) return;



let sym=t.symbol;


if(!portfolio[sym]){

portfolio[sym]={
units:0,
cost:0
};

}



let units=Number(t.units);

let net=Number(t.netAmount);



if(t.type==="ซื้อ"){


portfolio[sym].units += units;

portfolio[sym].cost += net;

cost += net;


}



if(t.type==="ขาย"){


let avg =
portfolio[sym].cost /
portfolio[sym].units;


let pnl =
net - (avg*units);



realized += pnl;


if(pnl>0)
win++;

else
loss++;



portfolio[sym].units -= units;

portfolio[sym].cost -= avg*units;


}



});



let totalTrade = win + loss;


document.getElementById("totalCost")
.innerHTML =
cost.toLocaleString();



document.getElementById("realizedPnL")
.innerHTML =
realized.toLocaleString(
undefined,
{
maximumFractionDigits:2
}
);



let rate =
totalTrade ?
(win / totalTrade * 100)
:0;



document.getElementById("winRate")
.innerHTML =
rate.toFixed(2)+"%";

}
