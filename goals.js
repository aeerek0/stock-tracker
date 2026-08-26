function saveGoals() {
    const goals = {
        portfolioGoal: Number(document.getElementById("inputPortfolioGoal").value) || 0,
        dividendGoal: Number(document.getElementById("inputDividendGoal").value) || 0,
        monthlyInvestment: Number(document.getElementById("inputMonthlyInvestment").value) || 0,
        expectedReturn: Number(document.getElementById("inputExpectedReturn").value) || 8,
        targetYear: document.getElementById("inputTargetYear").value
    };

    localStorage.setItem(
        "investmentGoals",
        JSON.stringify(goals)
    );

    alert("✅ บันทึกเป้าหมายเรียบร้อย");
    loadGoals();
}

function loadGoals() {
    const goals = JSON.parse(
        localStorage.getItem("investmentGoals")
    );

    if (!goals) return;

    document.getElementById("inputPortfolioGoal").value =
        goals.portfolioGoal || "";

    document.getElementById("inputDividendGoal").value =
        goals.dividendGoal || "";

    document.getElementById("inputMonthlyInvestment").value =
        goals.monthlyInvestment || "";

    document.getElementById("inputExpectedReturn").value =
        goals.expectedReturn || 8;

    document.getElementById("inputTargetYear").value =
        goals.targetYear || "";

    document.getElementById("portfolioGoalValue").innerText =
        formatNumber(goals.portfolioGoal);

    document.getElementById("dividendGoalValue").innerText =
        formatNumber(goals.dividendGoal);

    const currentPortfolio = Number(localStorage.getItem("currentPortfolioValue")) || 0;
    const currentDividend = Number(localStorage.getItem("currentDividendValue")) || 0;

renderSmartTips(
    currentPortfolio,
    goals.portfolioGoal,
    goals.monthlyInvestment,
    currentDividend,
    goals.expectedReturn,
    goals.targetYear
);
    document.getElementById("currentPortfolioValue").innerText = formatNumber(currentPortfolio) + " บาท";
    document.getElementById("currentDividendValue").innerText = formatNumber(currentDividend) + " บาท";

    document.getElementById("targetPortfolioValue").innerText = formatNumber(goals.portfolioGoal) + " บาท";
    document.getElementById("targetDividendValue").innerText = formatNumber(goals.dividendGoal) + " บาท";

    const portfolioPercent = goals.portfolioGoal > 0
        ? (currentPortfolio / goals.portfolioGoal) * 100
        : 0;

    document.getElementById("goalProgressPercent").innerText = portfolioPercent.toFixed(2);
    document.getElementById("goalProgressBar").style.width = Math.min(portfolioPercent, 100) + "%";

    document.getElementById("remainingGoal").innerText =
        formatNumber(Math.max(goals.portfolioGoal - currentPortfolio, 0));

    // ตรวจสอบว่ามี Element นี้อยู่ใน HTML หรือไม่ ป้องกัน Error กรณีไม่มี ID นี้
    const portfolioPercentEl = document.getElementById("portfolioPercent");
    if (portfolioPercentEl) {
        portfolioPercentEl.innerText = portfolioPercent.toFixed(2);
    }

    document.getElementById("portfolioProgress").style.width =
        Math.min(portfolioPercent, 100) + "%";

    const dividendPercent = goals.dividendGoal > 0
        ? (currentDividend / goals.dividendGoal) * 100
        : 0;

    document.getElementById("dividendGoalPercent").innerText = dividendPercent.toFixed(2);
    document.getElementById("dividendGoalProgressBar").style.width = Math.min(dividendPercent, 100) + "%";
    document.getElementById("remainingDividendGoal").innerText =
    formatNumber(Math.max(goals.dividendGoal - currentDividend, 0));

    // ตรวจสอบว่ามี Element นี้อยู่ใน HTML หรือไม่ ป้องกัน Error กรณีไม่มี ID นี้
    const dividendPercentEl = document.getElementById("dividendPercent");
    if (dividendPercentEl) {
        dividendPercentEl.innerText = dividendPercent.toFixed(2);
    }

    document.getElementById("dividendProgress").style.width =
        Math.min(dividendPercent, 100) + "%";



    const target = Number(goals.portfolioGoal);
    const current = currentPortfolio;
    const monthly = Number(goals.monthlyInvestment);
    const annualReturn = Number(goals.expectedReturn) / 100;

let projectionYear = "-";

if (target > current && monthly > 0) {

    let value = current;
    let months = 0;

    while (value < target && months < 1000) {
        value = value * (1 + annualReturn / 12);
        value += monthly;
        months++;
    }

    const finishDate = new Date();
    finishDate.setMonth(finishDate.getMonth() + months);

    projectionYear = finishDate.getFullYear().toString();

} else {

    projectionYear = goals.targetYear
        ? goals.targetYear.toString()
        : "-";

}

// =========================
// Goal Health
// =========================

const healthCurrentPortfolioEl =
    document.getElementById("healthCurrentPortfolio");

if (healthCurrentPortfolioEl) {
    healthCurrentPortfolioEl.innerText =
        formatNumber(currentPortfolio);
}


const healthTargetPortfolioEl =
    document.getElementById("healthTargetPortfolio");

if (healthTargetPortfolioEl) {
    healthTargetPortfolioEl.innerText =
        formatNumber(goals.portfolioGoal);
}





// ปีเป้าหมาย
const healthTargetYearEl =
    document.getElementById("healthTargetYear");

if (healthTargetYearEl) {
    healthTargetYearEl.innerText =
        goals.targetYear || "-";
}


// ปีคาดการณ์
const healthProjectionYearEl =
    document.getElementById("healthProjectionYear");

if (healthProjectionYearEl) {
    healthProjectionYearEl.innerText =
        projectionYear;
}


// เหลือกี่ปี
const healthRemainYearEl =
    document.getElementById("healthRemainYear");

if (healthRemainYearEl && projectionYear !== "-") {

    const remainYear =
        Number(projectionYear) - new Date().getFullYear();

    healthRemainYearEl.innerText =
        remainYear > 0 ? remainYear : 0;
}


// Status
const goalStatusEl =
    document.getElementById("goalStatus");

if(goalStatusEl){

    let status = "🟢 อยู่ในแผน";

    if (
        goals.targetYear &&
        projectionYear !== "-" &&
        Number(projectionYear) > Number(goals.targetYear)
    ) {
        status = "🟡 ต้องเร่งเพิ่ม";
    }

    goalStatusEl.innerText = status;

    const statusBox =
    document.getElementById("goalStatusBox");


if(statusBox){

    statusBox.classList.remove(
        "warning",
        "danger"
    );


    if(status.includes("ต้องเร่งเพิ่ม")){

        statusBox.classList.add("warning");

    }

    else if(status.includes("ไม่ทัน")){

        statusBox.classList.add("danger");

    }

}
}

    const healthResultEl = document.getElementById("healthResult");

if (healthResultEl) {

    const diff =
        Number(goals.targetYear) - Number(projectionYear);


    if (diff > 0) {

        healthResultEl.innerText =
            "เร็วกว่า " + diff + " ปี";

    } else if (diff < 0) {

        healthResultEl.innerText =
            "ช้ากว่า " + Math.abs(diff) + " ปี";

    } else {

        healthResultEl.innerText =
            "ตรงตามแผน";

    }

}

}

function formatNumber(value) {
    return Number(value || 0).toLocaleString("en-US");
}

function renderSmartTips(
    currentPortfolio,
    target,
    monthly,
    dividend,
    expectedReturn,
    targetYear
){

    const box = document.getElementById("smartTips");

    if(!box) return;


    let tips = "";


    // =========================
    // Portfolio Progress
    // =========================

    const portfolioPercent = target > 0
        ? (currentPortfolio / target) * 100
        : 0;


    let statusText = "";

    if(portfolioPercent < 25){

        statusText = "🌱 ระยะเริ่มต้นสร้างพอร์ต";

    } else if(portfolioPercent < 75){

        statusText = "🚀 กำลังเติบโต";

    } else if(portfolioPercent < 100){

        statusText = "🔥 ใกล้ถึงเป้าหมาย";

    } else {

        statusText = "🏆 บรรลุเป้าหมายแล้ว";

    }


    tips += `
    <div class="mb-3">

        📊 <b>สถานะพอร์ต</b><br>

        ${statusText}<br>

        ความสำเร็จ 
        <b>${portfolioPercent.toFixed(2)}%</b>

    </div>
    `;


    // =========================
    // Goal Analysis
    // =========================

    const remain =
        Math.max(target - currentPortfolio,0);


    tips += `
    <div class="mb-3">

        🎯 <b>เป้าหมาย</b><br>

        เป้าหมาย 
        <b>${formatNumber(target)} บาท</b><br>

        เหลืออีก 
        <b>${formatNumber(remain)} บาท</b>

    </div>
    `;



    // =========================
    // Investment Plan
    // =========================

    tips += `
    <div class="mb-3">

        📌 <b>แผนปัจจุบัน</b><br>

        ลงทุนเพิ่ม 
        <b>${formatNumber(monthly)} บาท/เดือน</b><br>

        พอร์ตปัจจุบัน 
        <b>${formatNumber(currentPortfolio)} บาท</b>

    </div>
    `;



    // =========================
    // Dividend Analysis
    // =========================

    const monthlyDividend =
        dividend / 12;


    tips += `
    <div>

        💰 <b>Passive Income</b><br>

        ปันผลปัจจุบัน 
        <b>${formatNumber(dividend)} บาท/ปี</b><br>

        เฉลี่ย 
        <b>${formatNumber(monthlyDividend)} บาท/เดือน</b>

    </div>
    `;

// =========================
// Extra Investment Suggestion
// =========================

let extraTip = "";


if (targetYear) {

    const currentYear = new Date().getFullYear();

    const years = Number(targetYear) - currentYear;


    if (years > 0) {

        let requiredMonthly = monthly;


        while (requiredMonthly < 100000) {

            let value = currentPortfolio;


            for (let i = 0; i < years * 12; i++) {

                value =
                    value * (1 + expectedReturn / 100 / 12);

                value += requiredMonthly;

            }


            if (value >= target) {
                break;
            }


            requiredMonthly += 500;

        }


        const extra = requiredMonthly - monthly;


        if (extra > 0) {


            extraTip = `

            <div class="goal-coach-card">

                <div class="goal-coach-title">
                    🤖 Goal Coach Recommendation
                </div>


                <div class="goal-coach-alert">

                    ⚠️ แผนปัจจุบันยังไม่ทันเป้าหมายปี 
                    ${targetYear}

                </div>


                <div class="coach-plan-row">


                    <div class="coach-box current">

                        <small>
                            ลงทุนปัจจุบัน
                        </small>

                        <strong>
                            ${formatNumber(monthly)}
                        </strong>

                        <span>
                            บาท/เดือน
                        </span>

                    </div>


                    <div class="coach-arrow">
                        ➜
                    </div>


                    <div class="coach-box recommend">

                        <small>
                            แนะนำ
                        </small>

                        <strong>
                            ${formatNumber(requiredMonthly)}
                        </strong>

                        <span>
                            บาท/เดือน
                        </span>

                    </div>


                </div>


                <div class="coach-extra">

                    🚀 ต้องเพิ่ม

                    <b>
                        +${formatNumber(extra)}
                        บาท/เดือน
                    </b>

                </div>


            </div>

            `;


        } else {


            extraTip = `

            <div class="goal-coach-card success">

                🤖 Goal Coach Recommendation

                <br><br>

                ✅ แผนปัจจุบันสามารถถึงเป้าหมายปี 
                ${targetYear}

            </div>

            `;

        }

    }

}


tips += extraTip;


box.innerHTML = tips;

    }
window.loadGoals = loadGoals;
