/* =====================================
V12 Ultimate
AI 주식 단타 분석 + 실전 매매 시스템
===================================== */

/* =====================================
KIS API 서버
===================================== */

const API_SERVER =
"https://first-gqm8.onrender.com";

/* =====================================
전역 변수
===================================== */

let stocks = [];

let chart = null;

/* =====================================
실전 매매 상태
===================================== */

let tradingState = {

```
started: false,

totalShares: 0,

totalCost: 0,

averagePrice: 0,

basePrice: 0,

targetPrice: 0
```

};

/* =====================================
매매 상태 저장 키
===================================== */

const TRADING_STORAGE_KEY =
"V12_TRADING_STATE";

/* =====================================
페이지 시작
===================================== */

document.addEventListener(
"DOMContentLoaded",
function () {

```
    loadTradingState();

    loadStocks();

    setupSearch();

}
```

);

/* =====================================
종목 데이터 불러오기
===================================== */

async function loadStocks() {

```
try {

    const response =
        await fetch(
            "stocks.json"
        );


    if (!response.ok) {

        throw new Error(
            "stocks.json 불러오기 실패"
        );

    }


    stocks =
        await response.json();


    console.log(
        "종목 데이터 로딩 완료:",
        stocks.length
    );


} catch (error) {

    console.error(
        "종목 데이터 오류:",
        error
    );

}
```

}

/* =====================================
검색 이벤트 설정
===================================== */

function setupSearch() {

```
const input =
    document.getElementById(
        "stockInput"
    );


const button =
    document.getElementById(
        "searchButton"
    );


if (input) {

    input.addEventListener(
        "input",
        autoComplete
    );


    input.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Enter"
            ) {

                searchStock();

            }

        }
    );

}


if (button) {

    button.addEventListener(
        "click",
        searchStock
    );

}
```

}

/* =====================================
자동완성
===================================== */

function autoComplete() {

```
const input =
    document.getElementById(
        "stockInput"
    );


const suggestions =
    document.getElementById(
        "suggestions"
    );


if (
    !input ||
    !suggestions
) {

    return;

}


const keyword =
    input.value
        .trim()
        .toLowerCase();


suggestions.innerHTML =
    "";


if (
    keyword.length === 0
) {

    return;

}


const results =
    stocks
        .filter(
            function (stock) {

                const name =
                    String(
                        stock.name || ""
                    )
                    .toLowerCase();


                const code =
                    String(
                        stock.code || ""
                    );


                return (

                    name.includes(
                        keyword
                    )

                    ||

                    code.includes(
                        keyword
                    )

                );

            }
        )
        .slice(
            0,
            10
        );


results.forEach(
    function (stock) {

        const div =
            document.createElement(
                "div"
            );


        div.className =
            "suggestion-item";


        div.textContent =
            stock.name
            +
            " ("
            +
            stock.code
            +
            ")";


        div.addEventListener(
            "click",
            function () {

                input.value =
                    stock.code;


                suggestions.innerHTML =
                    "";


                searchStock();

            }
        );


        suggestions.appendChild(
            div
        );

    }
);
```

}

/* =====================================
종목 찾기
===================================== */

function findStock(input) {

```
const keyword =
    String(
        input || ""
    )
    .trim()
    .toLowerCase();


if (!keyword) {

    return null;

}


return stocks.find(
    function (stock) {

        const name =
            String(
                stock.name || ""
            )
            .toLowerCase();


        const code =
            String(
                stock.code || ""
            );


        return (

            name === keyword

            ||

            code === keyword

        );

    }
);
```

}

/* =====================================
종목 검색
===================================== */

async function searchStock() {

```
const input =
    document.getElementById(
        "stockInput"
    );


if (!input) {

    return;

}


const keyword =
    input.value.trim();


if (!keyword) {

    alert(
        "종목명 또는 종목코드를 입력하세요."
    );

    return;

}


const stock =
    findStock(
        keyword
    );


let code =
    "";


if (stock) {

    code =
        stock.code;

} else {

    code =
        keyword;

}


code =
    String(
        code
    )
    .replace(
        /[^0-9]/g,
        ""
    );


if (
    code.length !== 6
) {

    alert(
        "올바른 6자리 종목코드를 입력하세요."
    );

    return;

}


setApiStatus(
    "조회 중"
);


try {

    const response =
        await fetch(

            API_SERVER
            +
            "/api/stock/"
            +
            code

        );


    if (!response.ok) {

        throw new Error(
            "API 오류"
        );

    }


    const data =
        await response.json();


    console.log(
        "종목 데이터:",
        data
    );


    displayStock(
        data,
        stock
    );


    setApiStatus(
        "정상"
    );


    setDataStatus(
        "정상"
    );


} catch (error) {

    console.error(
        error
    );


    setApiStatus(
        "오류"
    );


    setDataStatus(
        "오류"
    );


    alert(
        "주가 정보를 가져오지 못했습니다."
    );

}
```

}

/* =====================================
종목 데이터 화면 표시
===================================== */

function displayStock(
data,
stock
) {

```
if (!data) {

    return;

}


const price =
    Number(
        data.price || 0
    );


const change =
    Number(
        data.change || 0
    );


const volume =
    Number(
        data.volume || 0
    );


const stockName =
    document.getElementById(
        "stockName"
    );


if (stockName) {

    stockName.textContent =

        stock
            ? stock.name
            : data.name || "종목";

}


const stockCode =
    document.getElementById(
        "stockCode"
    );


if (stockCode) {

    stockCode.textContent =

        stock
            ? stock.code
            : data.code || "-";

}


const priceElement =
    document.getElementById(
        "price"
    );


if (priceElement) {

    priceElement.textContent =

        price > 0

            ? price.toLocaleString(
                "ko-KR"
            )
            +
            "원"

            : "-";

}


const changeElement =
    document.getElementById(
        "change"
    );


if (changeElement) {

    changeElement.textContent =

        change.toFixed(
            2
        )
        +
        "%";

}


const volumeElement =
    document.getElementById(
        "volume"
    );


if (volumeElement) {

    volumeElement.textContent =

        volume.toLocaleString(
            "ko-KR"
        );

}


updateMA(
    data
);


analyzeStock(
    data
);


drawChart(
    data
);


updateTradingUI(
    price
);
```

}

/* =====================================
이동평균선
===================================== */

function updateMA(
data
) {

```
const ma5 =
    Number(
        data.ma5 || 0
    );


const ma20 =
    Number(
        data.ma20 || 0
    );


const ma60 =
    Number(
        data.ma60 || 0
    );


const ma5Element =
    document.getElementById(
        "ma5"
    );


const ma20Element =
    document.getElementById(
        "ma20"
    );


const ma60Element =
    document.getElementById(
        "ma60"
    );


if (ma5Element) {

    ma5Element.textContent =

        ma5 > 0

            ? Math.round(
                ma5
            )
            .toLocaleString(
                "ko-KR"
            )
            +
            "원"

            : "-";

}


if (ma20Element) {

    ma20Element.textContent =

        ma20 > 0

            ? Math.round(
                ma20
            )
            .toLocaleString(
                "ko-KR"
            )
            +
            "원"

            : "-";

}


if (ma60Element) {

    ma60Element.textContent =

        ma60 > 0

            ? Math.round(
                ma60
            )
            .toLocaleString(
                "ko-KR"
            )
            +
            "원"

            : "-";

}
```

}

/* =====================================
AI 단타 분석
===================================== */

function analyzeStock(
data
) {

```
const price =
    Number(
        data.price || 0
    );


const change =
    Number(
        data.change || 0
    );


const volume =
    Number(
        data.volume || 0
    );


const ma5 =
    Number(
        data.ma5 || 0
    );


const ma20 =
    Number(
        data.ma20 || 0
    );


const ma60 =
    Number(
        data.ma60 || 0
    );


let score =
    0;


if (
    price > ma5 &&
    ma5 > 0
) {

    score += 20;

}


if (
    ma5 > ma20 &&
    ma20 > 0
) {

    score += 20;

}


if (
    ma20 > ma60 &&
    ma60 > 0
) {

    score += 20;

}


if (
    change > 2
) {

    score += 20;

}


if (
    volume > 1000000
) {

    score += 20;

}


let recommendation =
    "";


if (
    score >= 80
) {

    recommendation =
        "강한 매수";

}

else if (
    score >= 60
) {

    recommendation =
        "매수 관심";

}

else if (
    score >= 40
) {

    recommendation =
        "관망";

}

else {

    recommendation =
        "매수 주의";

}


const scoreElement =
    document.getElementById(
        "score"
    );


const recommendElement =
    document.getElementById(
        "recommend"
    );


if (scoreElement) {

    scoreElement.textContent =
        score
        +
        "점";

}


if (recommendElement) {

    recommendElement.textContent =
        recommendation;

}
```

}

/* =====================================
차트
===================================== */

function drawChart(
data
) {

```
const canvas =
    document.getElementById(
        "stockChart"
    );


if (!canvas) {

    return;

}


const candles =
    data.candles
    ||
    data.daily
    ||
    [];


if (
    !Array.isArray(
        candles
    )
    ||
    candles.length === 0
) {

    return;

}


const labels =
    candles.map(
        function (item) {

            return (

                item.date
                ||
                item.stck_bsop_date
                ||
                ""

            );

        }
    );


const prices =
    candles.map(
        function (item) {

            return Number(

                item.close
                ||
                item.stck_clpr
                ||
                0

            );

        }
    );


if (chart) {

    chart.destroy();

}


chart =
    new Chart(
        canvas,
        {

            type:
                "line",

            data:
                {

                    labels,

                    datasets:
                        [

                            {

                                label:
                                    "종가",

                                data:
                                    prices,

                                borderWidth:
                                    2,

                                tension:
                                    0.2,

                                fill:
                                    false

                            }

                        ]

                },

            options:
                {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    scales:
                        {

                            y:
                                {

                                    beginAtZero:
                                        false

                                }

                        }

                }

        }
    );
```

}

/* =====================================
매매 상태 저장
===================================== */

function saveTradingState() {

```
try {

    localStorage.setItem(

        TRADING_STORAGE_KEY,

        JSON.stringify(
            tradingState
        )

    );

} catch (error) {

    console.error(
        "매매 상태 저장 오류:",
        error
    );

}
```

}

/* =====================================
매매 상태 불러오기
===================================== */

function loadTradingState() {

```
try {

    const savedState =

        localStorage.getItem(

            TRADING_STORAGE_KEY

        );


    if (!savedState) {

        return;

    }


    const parsedState =

        JSON.parse(
            savedState
        );


    if (
        parsedState
        &&
        typeof parsedState ===
        "object"
    ) {

        tradingState = {

            started:
                Boolean(
                    parsedState.started
                ),

            totalShares:
                Number(
                    parsedState.totalShares
                    || 0
                ),

            totalCost:
                Number(
                    parsedState.totalCost
                    || 0
                ),

            averagePrice:
                Number(
                    parsedState.averagePrice
                    || 0
                ),

            basePrice:
                Number(
                    parsedState.basePrice
                    || 0
                ),

            targetPrice:
                Number(
                    parsedState.targetPrice
                    || 0
                )

        };

    }


    console.log(
        "기존 매매 상태 복구:",
        tradingState
    );


} catch (error) {

    console.error(
        "매매 상태 복구 오류:",
        error
    );

}
```

}

/* =====================================
평균매수가 계산
===================================== */

function calculateTradingAverage() {

```
if (
    tradingState.totalShares <= 0
) {

    tradingState.averagePrice =
        0;

    return;

}


tradingState.averagePrice =

    tradingState.totalCost
    /
    tradingState.totalShares;
```

}

/* =====================================
목표매도가 계산
===================================== */

function calculateTradingTarget() {

```
if (
    tradingState.averagePrice <= 0
) {

    tradingState.targetPrice =
        0;

    return;

}


tradingState.targetPrice =

    tradingState.averagePrice
    *
    1.05;
```

}

/* =====================================
매수 처리
===================================== */

function tradingBuy(
currentPrice,
buyShares
) {

```
currentPrice =
    Number(
        currentPrice
    );


buyShares =
    Number(
        buyShares
    );


if (
    currentPrice <= 0
    ||
    buyShares <= 0
) {

    return false;

}


const buyAmount =

    currentPrice
    *
    buyShares;


tradingState.totalCost +=
    buyAmount;


tradingState.totalShares +=
    buyShares;


tradingState.started =
    true;


calculateTradingAverage();


/*
   매수 후 평균매수가를
   새로운 기준가격으로 설정
*/

tradingState.basePrice =

    tradingState.averagePrice;


calculateTradingTarget();


saveTradingState();


return true;
```

}

/* =====================================
전량 매도 처리
===================================== */

function tradingSellAll(
currentPrice
) {

```
currentPrice =
    Number(
        currentPrice
    );


if (
    currentPrice <= 0
    ||
    tradingState.totalShares <= 0
) {

    return null;

}


const sellShares =
    tradingState.totalShares;


const sellAmount =
    currentPrice
    *
    sellShares;


const profit =
    sellAmount
    -
    tradingState.totalCost;


const result = {

    sellShares,

    sellAmount,

    profit

};


console.log(
    "전량매도:",
    result
);


/*
   매도 완료 후
   새로운 1회차를 준비
*/

tradingState = {

    started:
        false,

    totalShares:
        0,

    totalCost:
        0,

    averagePrice:
        0,

    basePrice:
        0,

    targetPrice:
        0

};


saveTradingState();


return result;
```

}

/* =====================================
매매 신호 판단
===================================== */

function getTradingSignal(
currentPrice
) {

```
currentPrice =
    Number(
        currentPrice
    );


/*
   1회차
   무조건 30주
*/

if (
    !tradingState.started
    ||
    tradingState.totalShares <= 0
) {

    return {

        action:
            "FIRST_BUY",

        shares:
            30,

        message:
            "🟢 1회차 → 무조건 30주 매수"

    };

}


/*
   평균매수가 대비 +5%
   전량매도
*/

if (

    tradingState.targetPrice > 0

    &&

    currentPrice >=
    tradingState.targetPrice

) {

    return {

        action:
            "SELL_ALL",

        shares:
            tradingState.totalShares,

        message:
            "🔵 평균매수가 +5% 도달 → 전량매도"

    };

}


/*
   현재가가 기준가격보다 낮음
   20주 추가매수
*/

if (

    currentPrice <
    tradingState.basePrice

) {

    return {

        action:
            "BUY_20",

        shares:
            20,

        message:
            "🔴 현재가 < 기준가격 → 20주 추가매수"

    };

}


/*
   현재가가 기준가격과 같음
   15주 추가매수
*/

if (

    currentPrice ===
    tradingState.basePrice

) {

    return {

        action:
            "BUY_15",

        shares:
            15,

        message:
            "🟠 현재가 = 기준가격 → 15주 추가매수"

    };

}


/*
   현재가가 기준가격보다 높음
   매수하지 않음
*/

return {

    action:
        "WAIT",

    shares:
        0,

    message:
        "⚪ 현재가 > 기준가격 → 매수하지 않음"

};
```

}

/* =====================================
매매 판단 버튼
===================================== */

function executeTradingDecision() {

```
const priceElement =
    document.getElementById(
        "price"
    );


if (!priceElement) {

    alert(
        "현재가를 먼저 조회하세요."
    );

    return;

}


const currentPrice =
    Number(

        priceElement.textContent
            .replace(
                /[^0-9]/g,
                ""
            )

    );


if (
    currentPrice <= 0
) {

    alert(
        "현재가를 확인할 수 없습니다."
    );

    return;

}


const signal =
    getTradingSignal(
        currentPrice
    );


updateTradingUI(
    currentPrice
);


alert(

    "현재가: "
    +
    currentPrice.toLocaleString(
        "ko-KR"
    )
    +
    "원\n\n"
    +
    signal.message
    +
    "\n\n"
    +
    "매수수량: "
    +
    signal.shares
    +
    "주"

);
```

}

/* =====================================
매수 실행 버튼
===================================== */

function executeBuy() {

```
const priceElement =
    document.getElementById(
        "price"
    );


if (!priceElement) {

    alert(
        "현재가를 먼저 조회하세요."
    );

    return;

}


const currentPrice =
    Number(

        priceElement.textContent
            .replace(
                /[^0-9]/g,
                ""
            )

    );


if (
    currentPrice <= 0
) {

    alert(
        "현재가를 확인할 수 없습니다."
    );

    return;

}


const signal =
    getTradingSignal(
        currentPrice
    );


/*
   목표가 도달
*/

if (
    signal.action ===
    "SELL_ALL"
) {

    alert(
        "평균매수가 대비 +5%에 도달했습니다.\n"
        +
        "🟦 전량매도를 실행하세요."
    );

    return;

}


/*
   기준가보다 높음
*/

if (
    signal.action ===
    "WAIT"
) {

    alert(
        "현재가가 기준가격보다 높습니다.\n\n"
        +
        "이번 매수는 건너뜁니다."
    );

    return;

}


const buyShares =
    signal.shares;


const confirmed =
    confirm(

        "현재가: "
        +
        currentPrice.toLocaleString(
            "ko-KR"
        )
        +
        "원\n"
        +
        "매수수량: "
        +
        buyShares
        +
        "주\n\n"
        +
        "매수하시겠습니까?"

    );


if (!confirmed) {

    return;

}


const success =
    tradingBuy(

        currentPrice,

        buyShares

    );


if (!success) {

    return;

}


updateTradingUI(
    currentPrice
);


alert(

    "🟢 매수 완료\n\n"
    +
    "매수수량: "
    +
    buyShares
    +
    "주\n"
    +
    "보유주식: "
    +
    tradingState.totalShares
    +
    "주\n"
    +
    "평균매수가: "
    +
    Math.round(
        tradingState.averagePrice
    ).toLocaleString(
        "ko-KR"
    )
    +
    "원\n"
    +
    "새 기준가격: "
    +
    Math.round(
        tradingState.basePrice
    ).toLocaleString(
        "ko-KR"
    )
    +
    "원\n"
    +
    "목표매도가: "
    +
    Math.round(
        tradingState.targetPrice
    ).toLocaleString(
        "ko-KR"
    )
    +
    "원"

);
```

}

/* =====================================
전량매도 버튼
===================================== */

function executeSellAll() {

```
if (
    tradingState.totalShares <= 0
) {

    alert(
        "현재 보유주식이 없습니다."
    );

    return;

}


const priceElement =
    document.getElementById(
        "price"
    );


if (!priceElement) {

    return;

}


const currentPrice =
    Number(

        priceElement.textContent
            .replace(
                /[^0-9]/g,
                ""
            )

    );


if (
    currentPrice <= 0
) {

    alert(
        "현재가를 확인할 수 없습니다."
    );

    return;

}


const confirmed =
    confirm(

        "현재가: "
        +
        currentPrice.toLocaleString(
            "ko-KR"
        )
        +
        "원\n\n"
        +
        "보유주식: "
        +
        tradingState.totalShares
        +
        "주\n\n"
        +
        "전량매도하시겠습니까?"

    );


if (!confirmed) {

    return;

}


const result =
    tradingSellAll(
        currentPrice
    );


if (!result) {

    return;

}


updateTradingUI(
    currentPrice
);


alert(

    "🔵 전량매도 완료\n\n"
    +
    "매도수량: "
    +
    result.sellShares
    +
    "주\n"
    +
    "매도금액: "
    +
    Math.round(
        result.sellAmount
    ).toLocaleString(
        "ko-KR"
    )
    +
    "원\n"
    +
    "실현손익: "
    +
    Math.round(
        result.profit
    ).toLocaleString(
        "ko-KR"
    )
    +
    "원\n\n"
    +
    "다음 거래부터 새로운 1회차\n"
    +
    "30주 매수를 시작합니다."

);
```

}

/* =====================================
실전 매매 화면 업데이트
===================================== */

function updateTradingUI(
currentPrice
) {

```
currentPrice =
    Number(
        currentPrice
    );


if (
    currentPrice <= 0
) {

    return;

}


const signal =
    getTradingSignal(
        currentPrice
    );


const currentElement =
    document.getElementById(
        "tradeCurrentPrice"
    );


if (currentElement) {

    currentElement.textContent =

        currentPrice.toLocaleString(
            "ko-KR"
        )
        +
        "원";

}


const baseElement =
    document.getElementById(
        "tradeBasePrice"
    );


if (baseElement) {

    baseElement.textContent =

        tradingState.basePrice > 0

            ? Math.round(
                tradingState.basePrice
            )
            .toLocaleString(
                "ko-KR"
            )
            +
            "원"

            : "-";

}


const averageElement =
    document.getElementById(
        "tradeAveragePrice"
    );


if (averageElement) {

    averageElement.textContent =

        tradingState.averagePrice > 0

            ? Math.round(
                tradingState.averagePrice
            )
            .toLocaleString(
                "ko-KR"
            )
            +
            "원"

            : "-";

}


const sharesElement =
    document.getElementById(
        "tradeShares"
    );


if (sharesElement) {

    sharesElement.textContent =

        tradingState.totalShares
        .toLocaleString(
            "ko-KR"
        )
        +
        "주";

}


const targetElement =
    document.getElementById(
        "tradeTargetPrice"
    );


if (targetElement) {

    targetElement.textContent =

        tradingState.targetPrice > 0

            ? Math.round(
                tradingState.targetPrice
            )
            .toLocaleString(
                "ko-KR"
            )
            +
            "원"

            : "-";

}


const signalElement =
    document.getElementById(
        "tradeSignal"
    );


if (signalElement) {

    signalElement.textContent =
        signal.message;

}


const nextBuyElement =
    document.getElementById(
        "nextBuyShares"
    );


if (nextBuyElement) {

    nextBuyElement.textContent =

        signal.shares > 0

            ? signal.shares + "주"

            : "없음";

}


const sellElement =
    document.getElementById(
        "sellShares"
    );


if (sellElement) {

    sellElement.textContent =

        signal.action ===
        "SELL_ALL"

            ? tradingState.totalShares
            + "주"

            : "0주";

}
```

}

/* =====================================
API 상태
===================================== */

function setApiStatus(
message
) {

```
const element =
    document.getElementById(
        "apiStatus"
    );


if (element) {

    element.textContent =
        message;

}
```

}

/* =====================================
데이터 상태
===================================== */

function setDataStatus(
message
) {

```
const element =
    document.getElementById(
        "dataStatus"
    );


if (element) {

    element.textContent =
        message;

}
```

}
