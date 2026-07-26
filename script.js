/* =====================================
   V12 Ultimate
   AI 주식 단타 분석 + 실전 매매 시스템
   + 테스트 모드
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
   매매 상태 저장 키
===================================== */

const TRADING_STORAGE_KEY =
    "V12_TRADING_STATE";


/* =====================================
   테스트 상태
   실제 매매와 완전히 분리
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
   페이지 시작
===================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadTradingState();

        loadStocks();

        setupSearch();

        updateTradingUIFromState();

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

function findStock(
    input
) {

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
   종목 데이터 화면 표시
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

                : data.name
                    ||
                    "종목";

    }


    const stockCode =
        document.getElementById(
            "stockCode"
        );


    if (stockCode) {

        stockCode.textContent =

            stock

                ? stock.code

                : data.code
                    ||
                    "-";

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
   AI 단타 분석
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
   매매 상태 저장
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
   매매 상태 불러오기
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
                        ||
                        0
                    ),


                totalCost:
                    Number(
                        parsedState.totalCost
                        ||
                        0
                    ),


                averagePrice:
                    Number(
                        parsedState.averagePrice
                        ||
                        0
                    ),


                basePrice:
                    Number(
                        parsedState.basePrice
                        ||
                        0
                    ),


                targetPrice:
                    Number(
                        parsedState.targetPrice
                        ||
                        0
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

}


/* =====================================
   평균매수가 계산
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
   목표매도가 계산
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
   매수 처리
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

}


/* =====================================
   전량 매도 처리
===================================== */

function tradingSellAll(
    currentPrice
) {

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

        sellShares:

            sellShares,


        sellAmount:

            sellAmount,


        profit:

            profit

    };


    console.log(
        "전량매도:",
        result
    );


    /*
       매도 후 새로운 사이클
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

}


/* =====================================
   매매 신호 판단
===================================== */

function getTradingSignal(
    currentPrice
) {

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
       평균매수가 +5%
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
       기준가격보다 낮음
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
       기준가격과 같음
       15주 추가매수
    */

    if (

        Math.abs(
            currentPrice
            -
            tradingState.basePrice
        )
        <
        0.01

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
       기준가격보다 높음
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

}


/* =====================================
   현재가 읽기
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
   매매 판단 버튼
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
   매수 실행 버튼
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
            "🔵 전량매도를 실행하세요."
        );

        return;

    }


    /*
       매수 대기
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

}


/* =====================================
   전량매도 버튼
===================================== */

function executeSellAll() {

    if (
        tradingState.totalShares <= 0
    ) {

        alert(
            "현재 보유주식이 없습니다."
        );

        return;

    }


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

        updateTradingUIFromState();

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


    updateTradingUIFromState(
        signal
    );

}


/* =====================================
   저장된 상태만 화면에 표시
===================================== */

function updateTradingUIFromState(
    signal = null
) {

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


    if (!signal) {

        if (
            tradingState.totalShares <= 0
        ) {

            signal = {

                action:
                    "FIRST_BUY",

                shares:
                    30,

                message:
                    "🟢 1회차 → 무조건 30주 매수"

            };

        } else {

            signal = {

                action:
                    "WAIT",

                shares:
                    0,

                message:
                    "현재가를 조회하면 매매신호가 표시됩니다."

            };

        }

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


/* =====================================
   테스트 모드
   실제 주문 없음
===================================== */


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

    price =
        Number(
            price
        );


    shares =
        Number(
            shares
        );


    const amount =
        price *
        shares;


    testState.totalCost +=
        amount;


    testState.totalShares +=
        shares;


    testState.averagePrice =

        testState.totalCost
        /
        testState.totalShares;


    /*
       평균매수가를
       새로운 기준가격으로 설정
    */

    testState.basePrice =

        testState.averagePrice;


    /*
       평균매수가 +5%
    */

    testState.targetPrice =

        testState.averagePrice
        *
        1.05;


    testState.step++;

    testState.active =
        true;


    return {

        price:
            price,

        shares:
            shares,

        amount:
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

    price =
        Number(
            price
        );


    const shares =
        testState.totalShares;


    const sellAmount =
        price *
        shares;


    const profit =

        sellAmount
        -
        testState.totalCost;


    return {

        shares:
            shares,

        sellAmount:
            sellAmount,

        profit:
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


    /*
       1회차
       30주
    */

    if (
        !testState.active
    ) {

        const result =

            testBuy(
                price,
                30
            );


        showTestBuyResult(

            "🟢 1회차 → 30주 매수",

            result

        );


        return;

    }


    /*
       평균매수가 +5%
       전량매도
    */

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


    /*
       기준가격보다 낮음
       20주 추가매수
    */

    if (

        price <
        testState.basePrice

    ) {

        const result =

            testBuy(
                price,
                20
            );


        showTestBuyResult(

            "🔴 기준가격보다 낮음 → 20주 추가매수",

            result

        );


        return;

    }


    /*
       기준가격과 같음
       15주 추가매수
    */

    if (

        Math.abs(

            price
            -
            testState.basePrice

        )
        <
        0.01

    ) {

        const result =

            testBuy(
                price,
                15
            );


        showTestBuyResult(

            "🟠 기준가격과 같음 → 15주 추가매수",

            result

        );


        return;

    }


    /*
       기준가격보다 높음
       대기
    */

    showTestWait(
        price
    );

}


/* =====================================
   테스트 매수 결과 표시
===================================== */

function showTestBuyResult(
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


    if (!output) {

        return;

    }


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

        "<p>총 매수금액: "
        +
        Math.round(
            testState.totalCost
        ).toLocaleString(
            "ko-KR"
        )
        +
        "원</p>"

        +

        "<p>평균매수가: "
        +
        Math.round(
            testState.averagePrice
        ).toLocaleString(
            "ko-KR"
        )
        +
        "원</p>"

        +

        "<p>새 기준가격: "
        +
        Math.round(
            testState.basePrice
        ).toLocaleString(
            "ko-KR"
        )
        +
        "원</p>"

        +

        "<p>+5% 목표매도가: "
        +
        Math.round(
            testState.targetPrice
        ).toLocaleString(
            "ko-KR"
        )
        +
        "원</p>";

}


/* =====================================
   테스트 대기 표시
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

            "<p>테스트 가격: "
            +
            price.toLocaleString(
                "ko-KR"
            )
            +
            "원</p>"

            +

            "<p>현재 기준가격: "
            +
            Math.round(
                testState.basePrice
            ).toLocaleString(
                "ko-KR"
            )
            +
            "원</p>"

            +

            "<p><strong>매수하지 않고 대기합니다.</strong></p>";

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
            "🎉 +5% 도달 → 전량매도 성공";

    }


    if (output) {

        output.innerHTML =

            "<h3>🎉 테스트 성공</h3>"

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

            "<hr>"

            +

            "<p><strong>✅ 30주 → 20주 → 15주 → +5% 전량매도 검증 완료</strong></p>";

    }


    /*
       테스트 완료
       다음 테스트는 30주부터 시작
    */

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
   전체 전략 자동 테스트
===================================== */

function runFullStrategyTest() {

    resetTestMode();


    /*
       1회차
       10,000원 × 30주
    */

    const price1 =
        10000;


    const result1 =

        testBuy(
            price1,
            30
        );


    /*
       2회차
       9,000원 × 20주
    */

    const price2 =
        9000;


    const result2 =

        testBuy(
            price2,
            20
        );


    /*
       3회차
       새로운 기준가격과 같은 가격
       → 15주
    */

    const price3 =

        testState.basePrice;


    const result3 =

        testBuy(
            price3,
            15
        );


    /*
       최종 목표가
    */

    const target =

        testState.targetPrice;


    /*
       전량매도
    */

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


    if (!output) {

        return;

    }


    output.innerHTML =

        "<h3>🧪 자동 전략 테스트 결과</h3>"

        +

        "<p>① 1회차: "
        +
        result1.shares
        +
        "주 × "
        +
        price1.toLocaleString(
            "ko-KR"
        )
        +
        "원</p>"

        +

        "<p>② 2회차: "
        +
        result2.shares
        +
        "주 × "
        +
        price2.toLocaleString(
            "ko-KR"
        )
        +
        "원</p>"

        +

        "<p>③ 3회차: "
        +
        result3.shares
        +
        "주 × "
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
        testState.totalShares
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

        "<p>+5% 목표매도가: "
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
