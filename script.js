 // --- ตัวแปร Global ---
let allocationChart = null;
let WEB_APP_URL = "";
let globalTradesData = [];
let displayCount = 50;
let currentMonitorView = 'stock';
let sortDirection = 1;
let portfolio = {};
let sectorPortfolio = {};
let realizedPnL = {};
let unrealizedPnL = {};
let sectorPnL = {};
let sectorUnrealizedPnL = {};
let currentPrices = {};

// --- ฟังก์ชัน initConnection ที่ปรับปรุงให้เหมือนเวอร์ชันล่าสุด ---
function initConnection() {

    const savedUrl = localStorage.getItem('user_google_sheet_url');

    const statusEl = document.getElementById('connectionStatus');
    const inputEl = document.getElementById('sheetUrlInput');

    if(savedUrl){

        WEB_APP_URL = savedUrl;

        if(inputEl){
            inputEl.value = savedUrl;
        }

        // แสดงสถานะกำลังเชื่อม
        if(statusEl){
            statusEl.innerHTML = "🟡 สถานะ: กำลังเชื่อมต่อ...";
            statusEl.className = "d-block mt-2 fw-bold text-warning";
        }


        // โหลดรายชื่อหุ้น
        if(typeof buildStockDropdown === 'function'){
            buildStockDropdown();
        }


        // ทดสอบ Connection
        fetch(WEB_APP_URL)
        .then(response => {

            if(!response.ok){
                throw new Error("Connection Error");
            }

            return response.json();

        })
        .then(data => {

            globalTradesData = data.trades;

           window.currentPrices = data.prices;


            if(statusEl){

                statusEl.innerHTML = 
                "🟢 สถานะ: เชื่อมต่อ Google Sheet สำเร็จ (" 
                + data.trades.length + " รายการ)"

                statusEl.className =
                "d-block mt-2 fw-bold text-success";

            }


            renderPortfolioAndRecords(globalTradesData);


        })
        .catch(error => {

            console.error(error);

            if(statusEl){

                statusEl.innerHTML =
                "🔴 สถานะ: เชื่อมต่อไม่สำเร็จ";

                statusEl.className =
                "d-block mt-2 fw-bold text-danger";

            }

        });


    }else{

        if(statusEl){

            statusEl.innerHTML =
            "🔴 สถานะ: ยังไม่ได้เชื่อมต่อ";

            statusEl.className =
            "d-block mt-2 fw-bold text-muted";

        }

    }

}

window.saveSheetUrl = function(){

    const urlInput = document.getElementById('sheetUrlInput');

    const url = urlInput.value.trim();


    if(url === ""){
        alert("กรุณาใส่ Web App URL");
        return;
    }


    localStorage.setItem(
        'user_google_sheet_url',
        url
    );


    WEB_APP_URL = url;


    initConnection();

};

const typeElement = document.getElementById('type');

if(typeElement){

typeElement.addEventListener('change', function() {

    const amountContainer = document.getElementById('amountContainer');
    const isCash = (this.value === 'ฝากเงิน' || this.value === 'ถอนเงิน');

    if(amountContainer){
        amountContainer.style.display = isCash ? 'block' : 'none';
    }

    document.getElementById('symbol').required = !isCash;
    document.getElementById('price').required = !isCash;
    document.getElementById('units').required = !isCash;

    if(document.getElementById('editRowIndex').value === "") { 
        document.getElementById('feeRate').value =
        this.value === 'ซื้อ' ? '0.0' : '0.1822';
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

    let dynamicSectorMap = {}; 

    
    
// --- 7. ฟังก์ชันเสริม ---
function buildStockDropdown() {
    const datalist = document.getElementById('stockOptions');
    if(datalist) {
        datalist.innerHTML = '';
        Object.keys(masterSectorMap).forEach(stock => {
            const option = document.createElement('option');
            option.value = stock;
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

    const dataMap = currentMonitorView === "stock"
        ? portfolio
        : sectorPortfolio;

    const pnLMap = currentMonitorView === "stock"
        ? realizedPnL
        : sectorPnL;

    const sorted = Object.keys(dataMap)
        .filter(k => dataMap[k].totalUnits > 0)
        .sort((a,b)=>{

            const roiA = dataMap[a].totalCost === 0 ? 0 :
                pnLMap[a] / dataMap[a].totalCost;

            const roiB = dataMap[b].totalCost === 0 ? 0 :
                pnLMap[b] / dataMap[b].totalCost;

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

    if(!WEB_APP_URL) return;


    document.getElementById('monitorTableBody').innerHTML =
    `<tr><td colspan="5">กำลังโหลดพอร์ตของคุณ...</td></tr>`;


    document.getElementById('tradeTableBody').innerHTML =
    `<tr><td colspan="12">กำลังโหลดประวัติ...</td></tr>`;


    fetch(WEB_APP_URL)

    .then(response => response.json())

    .then(data => {


        console.log("Refresh Data:", data);


        globalTradesData = data.trades || [];

        window.currentPrices = data.prices || {};


        dynamicSectorMap = {};


        globalTradesData.forEach(t=>{

            if(t.symbol && t.sector){

                dynamicSectorMap[
                    t.symbol.trim().toUpperCase()
                ] = t.sector;

            }

        });


        renderPortfolioAndRecords(globalTradesData);


    })

    .catch(error=>{

        console.error("Refresh Error:",error);


        document.getElementById('monitorTableBody').innerHTML =
        `<tr>
        <td colspan="5" class="text-danger">
        โหลดข้อมูลล้มเหลว
        </td>
        </tr>`;


        document.getElementById('tradeTableBody').innerHTML =
        `<tr>
        <td colspan="12" class="text-danger">
        โหลดข้อมูลล้มเหลว
        </td>
        </tr>`;

    });

}

    // ✏️ ฟังก์ชันดึงค่าเข้าสู่โหมดแก้ไขข้อมูล
    function startEditMode(rowIndex) {
        const trade = globalTradesData.find(t => t.rowIndex == rowIndex);
        if(!trade) return;

        // ดึงข้อมูลเก่าลงฟอร์มคีย์
        let dateVal = trade.date;
        if(dateVal.includes("T")) dateVal = dateVal.split("T")[0];
        
        document.getElementById('editRowIndex').value = trade.rowIndex;
        document.getElementById('date').value = dateVal;
        document.getElementById('type').value = trade.type;
        document.getElementById('symbol').value = trade.symbol;
        document.getElementById('sector').value = trade.sector || '';
        document.getElementById('broker').value = trade.broker || '';
        document.getElementById('price').value = trade.price;
        document.getElementById('units').value = trade.units;
        
        // คำนวณหา % ค่าธรรมเนียมเดิมกลับมาโชว์
        const gross = trade.price * trade.units;
        const feePercent = ((trade.feeTax / gross) * 100).toFixed(4);
        document.getElementById('feeRate').value = feePercent;

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


    document.getElementById('formTitle').innerText =
        "➕ บันทึกรายการใหม่";

    document.getElementById('editAlert').style.display = "none";


    const btn = document.getElementById('submitBtn');

    btn.disabled = false;   // <<< เพิ่มบรรทัดนี้

    btn.innerText =
        "💾 บันทึกส่งไปยัง Google Sheets";

    btn.style.backgroundColor =
        "var(--pastel-orange-dark)";
}
function renderMonitorTable(dataMap,pnLMap,sortedKeys=null){

    const mBody = document.getElementById('monitorTableBody');
    mBody.innerHTML = '';

    let totalValue = 0;

const keys = sortedKeys || Object.keys(dataMap);

keys.forEach(key=>{

    if(dataMap[key].totalUnits > 0){

        let marketPrice =
            window.currentPrices[key] || dataMap[key].avgPrice;

        totalValue +=
            dataMap[key].totalUnits * marketPrice;

    }

});


    Object.keys(dataMap).forEach(key => {

        const data = dataMap[key];

        if(data.totalUnits > 0){

            const roi = data.totalCost > 0 
                ? (pnLMap[key] / data.totalCost) * 100 
                : 0;


      let marketPrice =
    window.currentPrices[key] || data.avgPrice;


let marketValue =
    data.totalUnits * marketPrice;


const weight = totalValue > 0
    ? (marketValue / totalValue) * 100
    : 0;


            const row = document.createElement('tr');

            row.innerHTML = `

                <td class="fw-bold">${key}</td>

                <td>
                    ${data.totalUnits.toLocaleString()}
                </td>

                <td>
                    ${data.avgPrice.toLocaleString(undefined,{
                        maximumFractionDigits:2
                    })}
                </td>

                <td>
                    ${data.totalCost.toLocaleString(undefined,{
                        maximumFractionDigits:2
                    })}
                </td>

                <td class="text-secondary fw-bold">
                    ${weight.toFixed(1)}%
                </td>

                <td class="${pnLMap[key]>=0 
                    ? 'text-success' 
                    : 'text-danger'}">

                    ${pnLMap[key].toLocaleString(undefined,{
                        maximumFractionDigits:2
                    })}

                    <br>
                    <small>
                        (${roi.toFixed(2)}%)
                    </small>

                </td>

            `;

            mBody.appendChild(row);

        }

    });

}
function renderPortfolioAndRecords(trades) {
    document.getElementById('searchInput').value = "";
    if (trades) globalTradesData = trades;
    
    // 1. เตรียมตัวแปรสำหรับเก็บข้อมูลทั้งแบบรายหุ้นและราย Sector
portfolio = {};
sectorPortfolio = {};

realizedPnL = {};
unrealizedPnL = {};

sectorPnL = {};
sectorUnrealizedPnL = {};
 
    const tbodyRecord = document.getElementById('tradeTableBody');
    tbodyRecord.innerHTML = '';

    // 2. ลูปคำนวณข้อมูลทั้งหมด
    let totalPortfolioValue = 0, totalPnL = 0, activeStocksCount = 0;
    globalTradesData.forEach(trade => {
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

    if(portfolio[sym].totalUnits > 0){

let currentPrice =
    (window.currentPrices && window.currentPrices[sym])
    || portfolio[sym].avgPrice;


        let marketValue =
            portfolio[sym].totalUnits * currentPrice;


        unrealizedPnL[sym] =
            marketValue - portfolio[sym].totalCost;

    }

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

    document.getElementById('dashTotalValue').innerText = totalPortfolioValue.toLocaleString(undefined, {maximumFractionDigits: 0});
    document.getElementById('dashTotalPnL').innerText = (totalPnL >= 0 ? '+' : '') + totalPnL.toLocaleString(undefined, {minimumFractionDigits: 2});
    document.getElementById('dashTotalStocks').innerText = activeStocksCount;
    document.getElementById('dashTotalTrades').innerText = globalTradesData.length;

    // 3. Render ตารางประวัติ
    globalTradesData.slice(-displayCount).reverse().forEach(trade => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${new Date(trade.date).toLocaleDateString('en-CA')}</td><td class="${trade.type === 'ซื้อ' ? 'type-buy' : 'type-sell'}">${trade.type}</td><td class="fw-bold">${trade.symbol}</td><td>${trade.sector || '-'}</td><td>${trade.broker || '-'}</td><td>${parseFloat(trade.price).toLocaleString()}</td><td>${parseInt(trade.units).toLocaleString()}</td><td>${parseFloat(trade.grossAmount).toLocaleString()}</td><td>${parseFloat(trade.feeTax).toLocaleString()}</td><td class="fw-bold">${parseFloat(trade.netAmount).toLocaleString()}</td><td>-</td><td><button class="btn-action-edit" onclick="startEditMode(${trade.rowIndex})">✏️</button> <button class="btn-delete" onclick="deleteRecord(${trade.rowIndex}, '${trade.symbol}', ${trade.units})">🗑️</button></td>`;
        tbodyRecord.appendChild(row);
    });

    if (displayCount < globalTradesData.length) {
        const loadMoreRow = document.createElement('tr');
        loadMoreRow.innerHTML = `<td colspan="12"><button class="btn w-100" onclick="loadMore()">ดูรายการก่อนหน้าเพิ่มเติม...</button></td>`;
        tbodyRecord.appendChild(loadMoreRow);
    }

    // 4. Render Monitor Table ตาม View ที่เลือก (stock หรือ sector)
  // 4. Render Monitor Table
const dataMap = (currentMonitorView === 'stock') ? portfolio : sectorPortfolio;
const pnLMap = (currentMonitorView === 'stock') ? realizedPnL : sectorPnL;

renderMonitorTable(dataMap, pnLMap);
 drawAllocationChart(currentMonitorView);
}
    function loadMore() {
    displayCount += 50;
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
            <td>${parseFloat(trade.feeTax).toLocaleString()}</td>
            <td class="fw-bold">${parseFloat(trade.netAmount).toLocaleString()}</td>
            <td>-</td>
            <td>
                <button class="btn-action-edit" onclick="startEditMode(${trade.rowIndex})">✏️</button>
                <button class="btn-delete" onclick="deleteRecord(${trade.rowIndex}, '${trade.symbol}', ${trade.units})">🗑️</button>
            </td>`;
        tbodyRecord.appendChild(row);
    });
}
    
    function deleteRecord(rowIndex, symbol, units) {
        if (!confirm(`คุณต้องการลบรายการหุ้น ${symbol} จำนวน ${units.toLocaleString()} หุ้น ใช่หรือไม่?`)) {
            return;
        }

        document.getElementById('tradeTableBody').innerHTML = `<tr><td colspan="12" style="color:var(--pastel-sell); font-weight:bold;">⏳ กำลังลบข้อมูล...</td></tr>`;

       fetch(WEB_APP_URL,{
 method:"POST",
 cache:"no-cache",
 headers:{
   "Content-Type":"text/plain;charset=utf-8"
 },
 body:JSON.stringify({
   action:"delete",
   rowIndex:rowIndex
 })
})
.then(r=>r.json())
.then(()=>{

alert("ลบข้อมูลสำเร็จ!");

fetchAndRenderData();

})
.catch(err=>{

console.error(err);

alert("ลบข้อมูลล้มเหลว");

});
    }
        
const tradeForm = document.getElementById('tradeForm');

if(tradeForm){

tradeForm.addEventListener('submit', function(e){

    e.preventDefault();

    if(!WEB_APP_URL){
        alert("ยังไม่ได้เชื่อม Google Sheet");
        return;
    }

    const submitBtn = document.getElementById('submitBtn');
    const editRowIndex = document.getElementById('editRowIndex').value;

    submitBtn.disabled = true;
    submitBtn.innerText = "⏳ กำลังบันทึกข้อมูล...";

    const price = parseFloat(document.getElementById('price').value) || 0;
    const units = parseInt(document.getElementById('units').value) || 0;
    const feeRate = parseFloat(document.getElementById('feeRate').value) / 100;
    const type = document.getElementById('type').value;

    const grossAmount = price * units;
    const feeTax = grossAmount * feeRate;

    // แก้ไขตรงนี้: คำนวณ netAmount ให้จบในที่เดียว
    let netAmount = 0;
    if (type === 'ฝากเงิน') {
        netAmount = parseFloat(document.getElementById('amount').value) || 0;
    } else if (type === 'ถอนเงิน') {
        netAmount = parseFloat(document.getElementById('amount').value) || 0;
    } else {
        netAmount = type === 'ซื้อ' ? (grossAmount + feeTax) : (grossAmount - feeTax);
    }

    const tradeData = {
        action: editRowIndex !== "" ? "edit" : "insert",
        rowIndex: editRowIndex,
        date: document.getElementById('date').value,
        type: type,
        symbol: (type === 'ฝากเงิน' || type === 'ถอนเงิน') ? '-' : document.getElementById('symbol').value.trim().toUpperCase(),
        sector: (type === 'ฝากเงิน' || type === 'ถอนเงิน') ? 'Cash Management' : document.getElementById('sector').value,
        price: (type === 'ฝากเงิน' || type === 'ถอนเงิน') ? 0 : price,
        units: (type === 'ฝากเงิน' || type === 'ถอนเงิน') ? 0 : units,
        grossAmount: (type === 'ฝากเงิน' || type === 'ถอนเงิน') ? 0 : grossAmount.toFixed(2),
        feeTax: (type === 'ฝากเงิน' || type === 'ถอนเงิน') ? 0 : feeTax.toFixed(2),
        netAmount: netAmount.toFixed(2)
    };

fetch(WEB_APP_URL,{
    method:"POST",
    cache:"no-cache",
    headers:{
        "Content-Type":"text/plain;charset=utf-8"
    },
    body:JSON.stringify(tradeData)
})
.then(response => response.json())
.then(result => {

    console.log(result);

    if(result.status === "success"){

        alert(editRowIndex !== ""
            ? "อัปเดตข้อมูลสำเร็จ!"
            : "บันทึกข้อมูลสำเร็จ!");

        cancelEditMode();

        fetchAndRenderData();

    }else{

        submitBtn.disabled = false;
        submitBtn.innerText = "💾 บันทึกส่งไปยัง Google Sheets";

        alert("เกิดข้อผิดพลาด");

    }

})
.catch(err=>{

    console.error(err);

    submitBtn.disabled = false;
    submitBtn.innerText = "💾 บันทึกส่งไปยัง Google Sheets";

    alert("บันทึกข้อมูลไม่สำเร็จ");

});
});

}

function drawAllocationChart(view="stock") {


const dataMap =
view==="stock"
? portfolio
: sectorPortfolio;


const labels=[];
const values=[];


Object.keys(dataMap).forEach(key=>{


if(dataMap[key].totalUnits>0){


let value = 0;


// รายหุ้น
if(view==="stock"){

let price =
window.currentPrices[key] || 0;


value =
dataMap[key].totalUnits * price;


}else{


// sector ใช้ต้นทุนก่อน
value =
dataMap[key].totalCost;


}


labels.push(key);

values.push(value);


}


});


const canvas=document.getElementById("allocationChart");


if(allocationChart){
allocationChart.destroy();
}


allocationChart=new Chart(canvas,{

type:"doughnut",

data:{

labels:labels,

datasets:[{

data:values

}]

},

options:{

plugins:{

legend:{
position:"bottom"
},

tooltip:{

callbacks:{

label:function(ctx){

let total =
ctx.dataset.data.reduce(
(a,b)=>a+b,0
);


let percent =
(ctx.raw/total*100).toFixed(2);


return ctx.label+
" "+percent+"%";

}

}

}

}

}

});


}
// --- สั่งเริ่มทำงานเมื่อเปิดหน้าเว็บ ---
window.onload=function(){

    const dateInput=document.getElementById('date');

    if(dateInput){
        dateInput.valueAsDate=new Date();
    }

    initConnection();

};
