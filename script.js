/* =====================================
   V12 Ultimate
   AI 주식 단타 분석
   실전 매매 + 테스트 모드
   실시간 자동 시뮬레이션 통합본
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

    started: false,

    totalShares: 0,

    totalCost: 0,

    averagePrice: 0,

    basePrice: 0,

    targetPrice: 0

};


/* =====================================
   실전 매매 저장 키
===================================== */

const TRADING_STORAGE_KEY =
    "V12_TRADING_STATE";


/* =====================================
   테스트 모드 상태
===================================== */

let testState = {

    active: false,

    step: 0,

    totalShares: 0,

    totalCost: 0,

    averagePrice: 0,

    basePrice: 0,

    targetPrice: 0

};


/* =====================================
   실시간 자동 시뮬레이션 상태
===================================== */

let autoSimulation = {

    running: false,

    timer: null,

    code: "",

    name: "",

    lastPrice: 0,

    checkInterval: 5000,

    totalShares: 0,

    totalCost: 0,

    averagePrice: 0,

    basePrice: 0,

    targetPrice: 0,

    tradeCount: 0,

    lastAction: "대기",

    startedAt: null

};


/* =====================================
   페이지 시작
===================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadTradingState();

        loadStocks();

        setupSearch();

        updateTradingUI(
            0
        );

        console.log(
            "V12 Ultimate 시작"
        );

    }
);


/* =====================================
   종목 데이터 불러오기
===================================== */

async function loadStocks() {

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

}


/* =====================================
   검색 이벤트 설정
===================================== */

function setupSearch() {

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

}


/* =====================================
   자동완성
===================================== */

function autoComplete() {

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

}


/* =====================================
   종목 찾기
===================================== */

function findStock(input) {

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

}


/* =====================================
   종목 검색
===================================== */

async function searchStock() {

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


        /*
           실시간 자동 시뮬레이션에서
           사용할 종목 저장
        */

        autoSimulation.code =
            code;


        autoSimulation.name =

            stock
                ? stock.name
                : data.name || code;


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

}


/* =====================================
   종목 데이터 표시
===================================== */

function displayStock(
    data,
    stock
) {

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

}


/* =====================================
   이동평균선
===================================== */

function updateMA(
    data
) {

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

}


/* =====================================
   AI 분석
===================================== */

function analyzeStock(
    data
) {

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


    let recommendation;


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

}


/* =====================================
   차트
===================================== */

function drawChart(
    data
) {

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

}


/* =====================================
   실전 매매 상태 저장
===================================== */

function saveTradingState() {

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

}


/* =====================================
   실전 매매 상태 불러오기
===================================== */

function loadTradingState() {

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


    } catch (error) {

        console.error(
            "매매 상태 복구 오류:",
            error
        );

    }

}


/* =====================================
   평균매수가
===================================== */

function calculateTradingAverage() {

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

}


/* =====================================
   목표매도가
===================================== */

function calculateTradingTarget() {

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

}


/* =====================================
   실전 매수
===================================== */

function tradingBuy(
    currentPrice,
    buyShares
) {

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


    tradingState.totalCost +=

        currentPrice
        *
        buyShares;


    tradingState.totalShares +=
        buyShares;


    tradingState.started =
        true;


    calculateTradingAverage();


    tradingState.basePrice =
        tradingState.averagePrice;


    calculateTradingTarget();


    saveTradingState();


    return true;

}


/* =====================================
   실전 전량매도
===================================== */

function tradingSellAll(
    currentPrice
) {

    if (
        currentPrice <= 0
        ||
        tradingState.totalShares <= 0
    ) {

        return null;

    }


    const result = {

        sellShares:
            tradingState.totalShares,

        sellAmount:
            currentPrice
            *
            tradingState.totalShares,

        profit:
            (
                currentPrice
                *
                tradingState.totalShares
            )
            -
            tradingState.totalCost

    };


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

}


/* =====================================
   실전 매매 판단
===================================== */

function getTradingSignal(
    currentPrice
) {

    currentPrice =
        Number(
            currentPrice
        );


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


    return {

        action:
            "WAIT",

        shares:
            0,

        message:
            "⚪ 현재가 > 기준가격 → 매수하지 않음"

    };

}


/* =====================================
   현재가 가져오기
===================================== */

function getCurrentPriceFromScreen() {

    const priceElement =
        document.getElementById(
            "price"
        );


    if (!priceElement) {

        return 0;

    }


    return Number(

        priceElement.textContent
            .replace(
                /[^0-9]/g,
                ""
            )

    );

}


/* =====================================
   실전 매매 판단 버튼
===================================== */

function executeTradingDecision() {

    const currentPrice =
        getCurrentPriceFromScreen();


    if (
        currentPrice <= 0
    ) {

        alert(
            "현재가를 먼저 조회하세요."
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

}


/* =====================================
   실전 매수 실행
===================================== */

function executeBuy() {

    const currentPrice =
        getCurrentPriceFromScreen();


    if (
        currentPrice <= 0
    ) {

        alert(
            "현재가를 먼저 조회하세요."
        );

        return;

    }


    const signal =
        getTradingSignal(
            currentPrice
        );


    if (
        signal.action ===
        "SELL_ALL"
    ) {

        alert(
            "평균매수가 대비 +5% 도달\n전량매도 대상입니다."
        );

        return;

    }


    if (
        signal.action ===
        "WAIT"
    ) {

        alert(
            "현재가가 기준가격보다 높습니다.\n매수하지 않습니다."
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
            "원\n"
            +
            "매수수량: "
            +
            signal.shares
            +
            "주\n\n"
            +
            "매수하시겠습니까?"

        );


    if (!confirmed) {

        return;

    }


    tradingBuy(

        currentPrice,

        signal.shares

    );


    updateTradingUI(
        currentPrice
    );


    alert(
        "🟢 매수 완료\n\n"
        +
        "매수수량: "
        +
        signal.shares
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

}


/* =====================================
   실전 전량매도
===================================== */

function executeSellAll() {

    const currentPrice =
        getCurrentPriceFromScreen();


    if (
        currentPrice <= 0
    ) {

        alert(
            "현재가를 먼저 조회하세요."
        );

        return;

    }


    if (
        tradingState.totalShares <= 0
    ) {

        alert(
            "보유주식이 없습니다."
        );

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
        "원"

    );

}


/* =====================================
   실전 매매 화면 업데이트
===================================== */

function updateTradingUI(
    currentPrice
) {

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
                ).toLocaleString(
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
                ).toLocaleString(
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
                ).toLocaleString(
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

                ? signal.shares
                +
                "주"

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
                +
                "주"

                : "0주";

    }

}


/* =================================================
   테스트 모드
================================================= */


/* =====================================
   테스트 초기화
===================================== */

function resetTestMode() {

    testState = {

        active: false,

        step: 0,

        totalShares: 0,

        totalCost: 0,

        averagePrice: 0,

        basePrice: 0,

        targetPrice: 0

    };


    const status =
        document.getElementById(
            "testStatus"
        );


    const result =
        document.getElementById(
            "testResult"
        );


    if (status) {

        status.textContent =
            "테스트가 초기화되었습니다.";

    }


    if (result) {

        result.innerHTML =
            "테스트 대기";

    }

}


/* =====================================
   테스트 매수
===================================== */

function testBuy(
    price,
    shares
) {

    const amount =
        price
        *
        shares;


    testState.totalCost +=
        amount;


    testState.totalShares +=
        shares;


    testState.averagePrice =

        testState.totalCost
        /
        testState.totalShares;


    testState.basePrice =
        testState.averagePrice;


    testState.targetPrice =

        testState.averagePrice
        *
        1.05;


    testState.step++;


    return {

        price,

        shares,

        amount,

        averagePrice:
            testState.averagePrice,

        basePrice:
            testState.basePrice,

        targetPrice:
            testState.targetPrice

    };

}


/* =====================================
   테스트 전량매도
===================================== */

function testSellAll(
    price
) {

    const shares =
        testState.totalShares;


    const sellAmount =
        price
        *
        shares;


    const profit =

        sellAmount
        -
        testState.totalCost;


    return {

        shares,

        sellAmount,

        profit

    };

}


/* =====================================
   가격 직접 테스트
===================================== */

function runTestPrice() {

    const input =
        document.getElementById(
            "testPriceInput"
        );


    if (!input) {

        return;

    }


    const price =
        Number(
            input.value
        );


    if (
        price <= 0
    ) {

        alert(
            "테스트 가격을 입력하세요."
        );

        return;

    }


    if (
        !testState.active
    ) {

        testState.active =
            true;


        const result =
            testBuy(
                price,
                30
            );


        showTestResult(

            "🟢 1회차 → 30주 매수",

            result

        );


        return;

    }


    if (

        testState.targetPrice > 0

        &&

        price >=
        testState.targetPrice

    ) {

        const result =
            testSellAll(
                price
            );


        showTestSellResult(
            result
        );


        return;

    }


    if (

        price <
        testState.basePrice

    ) {

        const result =
            testBuy(
                price,
                20
            );


        showTestResult(

            "🔴 현재가 < 기준가격 → 20주 추가매수",

            result

        );


        return;

    }


    if (

        price ===
        testState.basePrice

    ) {

        const result =
            testBuy(
                price,
                15
            );


        showTestResult(

            "🟠 현재가 = 기준가격 → 15주 추가매수",

            result

        );


        return;

    }


    showTestWait(
        price
    );

}


/* =====================================
   테스트 결과
===================================== */

function showTestResult(
    title,
    result
) {

    const status =
        document.getElementById(
            "testStatus"
        );


    const output =
        document.getElementById(
            "testResult"
        );


    if (status) {

        status.textContent =
            title;

    }


    if (output) {

        output.innerHTML =

            "<p><strong>"
            +
            title
            +
            "</strong></p>"

            +

            "<p>매수가: "
            +
            result.price.toLocaleString(
                "ko-KR"
            )
            +
            "원</p>"

            +

            "<p>매수수량: "
            +
            result.shares
            +
            "주</p>"

            +

            "<p>총 보유주식: "
            +
            testState.totalShares
            +
            "주</p>"

            +

            "<p>평균매수가: "
            +
            Math.round(
                result.averagePrice
            ).toLocaleString(
                "ko-KR"
            )
            +
            "원</p>"

            +

            "<p>기준가격: "
            +
            Math.round(
                result.basePrice
            ).toLocaleString(
                "ko-KR"
            )
            +
            "원</p>"

            +

            "<p>+5% 목표가: "
            +
            Math.round(
                result.targetPrice
            ).toLocaleString(
                "ko-KR"
            )
            +
            "원</p>";

    }

}


/* =====================================
   테스트 대기
===================================== */

function showTestWait(
    price
) {

    const status =
        document.getElementById(
            "testStatus"
        );


    const output =
        document.getElementById(
            "testResult"
        );


    if (status) {

        status.textContent =
            "⚪ 기준가격보다 높음 → 매수하지 않음";

    }


    if (output) {

        output.innerHTML =

            "<p>현재 테스트 가격: "
            +
            price.toLocaleString(
                "ko-KR"
            )
            +
            "원</p>"

            +

            "<p>기준가격: "
            +
            Math.round(
                testState.basePrice
            ).toLocaleString(
                "ko-KR"
            )
            +
            "원</p>"

            +

            "<p><strong>매수하지 않고 대기</strong></p>";

    }

}


/* =====================================
   테스트 매도 결과
===================================== */

function showTestSellResult(
    result
) {

    const status =
        document.getElementById(
            "testStatus"
        );


    const output =
        document.getElementById(
            "testResult"
        );


    if (status) {

        status.textContent =
            "🔵 +5% 도달 → 전량매도 성공";

    }


    if (output) {

        output.innerHTML =

            "<h3>🎉 테스트 완료</h3>"

            +

            "<p>매도수량: "
            +
            result.shares
            +
            "주</p>"

            +

            "<p>매도금액: "
            +
            Math.round(
                result.sellAmount
            ).toLocaleString(
                "ko-KR"
            )
            +
            "원</p>"

            +

            "<p>실현손익: "
            +
            Math.round(
                result.profit
            ).toLocaleString(
                "ko-KR"
            )
            +
            "원</p>"

            +

            "<p><strong>✅ 전략 테스트 성공</strong></p>";

    }


    resetTestStateOnly();

}


/* =====================================
   테스트 상태만 초기화
===================================== */

function resetTestStateOnly() {

    testState = {

        active: false,

        step: 0,

        totalShares: 0,

        totalCost: 0,

        averagePrice: 0,

        basePrice: 0,

        targetPrice: 0

    };

}


/* =====================================
   전체 전략 테스트
===================================== */

function runFullStrategyTest() {

    resetTestMode();


    const price1 =
        10000;


    const result1 =
        testBuy(
            price1,
            30
        );


    testState.active =
        true;


    const price2 =
        9000;


    const result2 =
        testBuy(
            price2,
            20
        );


    const price3 =
        testState.basePrice;


    const result3 =
        testBuy(
            price3,
            15
        );


    const target =
        testState.targetPrice;


    const sell =
        testSellAll(
            target
        );


    const output =
        document.getElementById(
            "testResult"
        );


    const status =
        document.getElementById(
            "testStatus"
        );


    if (status) {

        status.textContent =
            "🎉 전체 전략 테스트 완료";

    }


    if (output) {

        output.innerHTML =

            "<h3>🧪 자동 테스트 결과</h3>"

            +

            "<p>① 30주 × "
            +
            price1.toLocaleString(
                "ko-KR"
            )
            +
            "원</p>"

            +

            "<p>② 20주 × "
            +
            price2.toLocaleString(
                "ko-KR"
            )
            +
            "원</p>"

            +

            "<p>③ 15주 × "
            +
            Math.round(
                price3
            ).toLocaleString(
                "ko-KR"
            )
            +
            "원</p>"

            +

            "<hr>"

            +

            "<p>총 보유주식: "
            +
            (
                result1.shares
                +
                result2.shares
                +
                result3.shares
            )
            +
            "주</p>"

            +

            "<p>최종 평균매수가: "
            +
            Math.round(
                testState.averagePrice
            ).toLocaleString(
                "ko-KR"
            )
            +
            "원</p>"

            +

            "<p>+5% 목표가: "
            +
            Math.round(
                testState.targetPrice
            ).toLocaleString(
                "ko-KR"
            )
            +
            "원</p>"

            +

            "<p>전량매도: "
            +
            sell.shares
            +
            "주</p>"

            +

            "<p>실현손익: "
            +
            Math.round(
                sell.profit
            ).toLocaleString(
                "ko-KR"
            )
            +
            "원</p>"

            +

            "<hr>"

            +

            "<h3>✅ 전략 테스트 성공</h3>";

    }


    resetTestStateOnly();

}


/* =================================================
   실시간 자동 시뮬레이션
================================================= */


/* =====================================
   현재 종목 가격 재조회
===================================== */

async function fetchSimulationPrice() {

    if (
        !autoSimulation.code
    ) {

        return null;

    }


    try {

        const response =
            await fetch(

                API_SERVER
                +
                "/api/stock/"
                +
                autoSimulation.code
                +
                "?t="
                +
                Date.now()

            );


        if (!response.ok) {

            throw new Error(
                "실시간 가격 조회 실패"
            );

        }


        const data =
            await response.json();


        return Number(
            data.price || 0
        );


    } catch (error) {

        console.error(
            "시뮬레이션 가격 조회 오류:",
            error
        );


        return null;

    }

}


/* =====================================
   실시간 자동 시뮬레이션 시작
===================================== */

async function startAutoSimulation() {

    if (
        autoSimulation.running
    ) {

        alert(
            "이미 실시간 자동 시뮬레이션이 실행 중입니다."
        );

        return;

    }


    if (
        !autoSimulation.code
    ) {

        alert(
            "먼저 종목을 검색하세요."
        );

        return;

    }


    autoSimulation.running =
        true;


    autoSimulation.startedAt =
        new Date();


    autoSimulation.lastAction =
        "시뮬레이션 시작";


    updateAutoSimulationUI();


    /*
       첫 가격 즉시 확인
    */

    await processAutoSimulation();


    /*
       5초마다 현재가 확인
    */

    autoSimulation.timer =

        setInterval(

            processAutoSimulation,

            autoSimulation.checkInterval

        );


    updateAutoSimulationUI();

}


/* =====================================
   실시간 자동 시뮬레이션 중지
===================================== */

function stopAutoSimulation() {

    if (
        autoSimulation.timer
    ) {

        clearInterval(
            autoSimulation.timer
        );

    }


    autoSimulation.timer =
        null;


    autoSimulation.running =
        false;


    autoSimulation.lastAction =
        "시뮬레이션 중지";


    updateAutoSimulationUI();

}


/* =====================================
   실시간 가격 감지 + 전략 판단
===================================== */

async function processAutoSimulation() {

    if (
        !autoSimulation.running
    ) {

        return;

    }


    const currentPrice =
        await fetchSimulationPrice();


    if (
        !currentPrice
        ||
        currentPrice <= 0
    ) {

        autoSimulation.lastAction =
            "가격 조회 실패";


        updateAutoSimulationUI();


        return;

    }


    autoSimulation.lastPrice =
        currentPrice;


    /*
       시뮬레이션 전용 상태를
       실전 상태와 분리하여 사용
    */

    const signal =
        getAutoSimulationSignal(
            currentPrice
        );


    /*
       첫 매수
    */

    if (
        signal.action ===
        "FIRST_BUY"
    ) {

        autoSimulationBuy(
            currentPrice,
            30
        );


        autoSimulation.lastAction =
            "🟢 30주 첫 매수 실행";

    }


    /*
       20주 추가매수
    */

    else if (
        signal.action ===
        "BUY_20"
    ) {

        autoSimulationBuy(
            currentPrice,
            20
        );


        autoSimulation.lastAction =
            "🔴 20주 추가매수 실행";

    }


    /*
       15주 추가매수
    */

    else if (
        signal.action ===
        "BUY_15"
    ) {

        autoSimulationBuy(
            currentPrice,
            15
        );


        autoSimulation.lastAction =
            "🟠 15주 추가매수 실행";

    }


    /*
       +5% 전량매도
    */

    else if (
        signal.action ===
        "SELL_ALL"
    ) {

        const result =
            autoSimulationSellAll(
                currentPrice
            );


        autoSimulation.lastAction =

            "🔵 +5% 도달 → "
            +
            result.sellShares
            +
            "주 전량매도";


        /*
           매도 후 자동으로
           새로운 30주 매수 사이클 시작
        */

    }


    /*
       매수하지 않는 경우
    */

    else {

        autoSimulation.lastAction =
            "⚪ 조건 미충족 → 대기";

    }


    updateAutoSimulationUI();

}


/* =====================================
   자동 시뮬레이션 매매 판단
===================================== */

function getAutoSimulationSignal(
    price
) {

    if (
        autoSimulation.totalShares <= 0
    ) {

        return {

            action:
                "FIRST_BUY",

            shares:
                30

        };

    }


    if (

        autoSimulation.targetPrice > 0

        &&

        price >=
        autoSimulation.targetPrice

    ) {

        return {

            action:
                "SELL_ALL",

            shares:
                autoSimulation.totalShares

        };

    }


    if (

        price <
        autoSimulation.basePrice

    ) {

        return {

            action:
                "BUY_20",

            shares:
                20

        };

    }


    if (

        price ===
        autoSimulation.basePrice

    ) {

        return {

            action:
                "BUY_15",

            shares:
                15

        };

    }


    return {

        action:
            "WAIT",

        shares:
            0

    };

}


/* =====================================
   자동 시뮬레이션 매수
===================================== */

function autoSimulationBuy(
    price,
    shares
) {

    autoSimulation.totalCost +=

        price
        *
        shares;


    autoSimulation.totalShares +=
        shares;


    autoSimulation.averagePrice =

        autoSimulation.totalCost
        /
        autoSimulation.totalShares;


    autoSimulation.basePrice =

        autoSimulation.averagePrice;


    autoSimulation.targetPrice =

        autoSimulation.averagePrice
        *
        1.05;


    autoSimulation.tradeCount++;

}


/* =====================================
   자동 시뮬레이션 전량매도
===================================== */

function autoSimulationSellAll(
    price
) {

    const sellShares =
        autoSimulation.totalShares;


    const sellAmount =

        price
        *
        sellShares;


    const profit =

        sellAmount
        -
        autoSimulation.totalCost;


    const result = {

        sellShares,

        sellAmount,

        profit

    };


    /*
       매도 후 새로운 사이클
    */

    autoSimulation.totalShares =
        0;


    autoSimulation.totalCost =
        0;


    autoSimulation.averagePrice =
        0;


    autoSimulation.basePrice =
        0;


    autoSimulation.targetPrice =
        0;


    autoSimulation.tradeCount++;


    return result;

}


/* =====================================
   자동 시뮬레이션 화면 업데이트
===================================== */

function updateAutoSimulationUI() {

    /*
       현재 HTML에
       시뮬레이션 전용 영역이 있으면 표시
    */


    const status =
        document.getElementById(
            "autoSimulationStatus"
        );


    const result =
        document.getElementById(
            "autoSimulationResult"
        );


    if (status) {

        if (
            autoSimulation.running
        ) {

            status.textContent =

                "🟢 실행 중 | "
                +
                autoSimulation.lastAction;

        } else {

            status.textContent =

                "⚪ 정지 | "
                +
                autoSimulation.lastAction;

        }

    }


    if (result) {

        result.innerHTML =

            "<p>종목: "
            +
            (
                autoSimulation.name
                ||
                autoSimulation.code
                ||
                "-"
            )
            +
            "</p>"

            +

            "<p>현재가: "
            +
            (
                autoSimulation.lastPrice > 0

                    ? Math.round(
                        autoSimulation.lastPrice
                    ).toLocaleString(
                        "ko-KR"
                    )
                    +
                    "원"

                    : "-"
            )
            +
            "</p>"

            +

            "<p>보유주식: "
            +
            autoSimulation.totalShares
            +
            "주</p>"

            +

            "<p>평균매수가: "
            +
            (
                autoSimulation.averagePrice > 0

                    ? Math.round(
                        autoSimulation.averagePrice
                    ).toLocaleString(
                        "ko-KR"
                    )
                    +
                    "원"

                    : "-"
            )
            +
            "</p>"

            +

            "<p>기준가격: "
            +
            (
                autoSimulation.basePrice > 0

                    ? Math.round(
                        autoSimulation.basePrice
                    ).toLocaleString(
                        "ko-KR"
                    )
                    +
                    "원"

                    : "-"
            )
            +
            "</p>"

            +

            "<p>+5% 목표가: "
            +
            (
                autoSimulation.targetPrice > 0

                    ? Math.round(
                        autoSimulation.targetPrice
                    ).toLocaleString(
                        "ko-KR"
                    )
                    +
                    "원"

                    : "-"
            )
            +
            "</p>"

            +

            "<p>거래 횟수: "
            +
            autoSimulation.tradeCount
            +
            "회</p>"

            +

            "<p><strong>"
            +
            autoSimulation.lastAction
            +
            "</strong></p>";

    }

}


/* =====================================
   자동 시뮬레이션 초기화
===================================== */

function resetAutoSimulation() {

    stopAutoSimulation();


    autoSimulation = {

        running:
            false,

        timer:
            null,

        code:
            autoSimulation.code,

        name:
            autoSimulation.name,

        lastPrice:
            0,

        checkInterval:
            5000,

        totalShares:
            0,

        totalCost:
            0,

        averagePrice:
            0,

        basePrice:
            0,

        targetPrice:
            0,

        tradeCount:
            0,

        lastAction:
            "초기화",

        startedAt:
            null

    };


    updateAutoSimulationUI();

}


/* =====================================
   API 상태
===================================== */

function setApiStatus(
    message
) {

    const element =
        document.getElementById(
            "apiStatus"
        );


    if (element) {

        element.textContent =
            message;

    }

}


/* =====================================
   데이터 상태
===================================== */

function setDataStatus(
    message
) {

    const element =
        document.getElementById(
            "dataStatus"
        );


    if (element) {

        element.textContent =
            message;

    }

}
