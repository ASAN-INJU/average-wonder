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

    started: false,

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

        loadStocks();

        setupSearch();

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


        if (
            !response.ok
        ) {

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


    if (
        input
    ) {


        input.addEventListener(
            "input",
            autoComplete
        );


        input.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key
                    ===
                    "Enter"
                ) {

                    searchStock();

                }

            }
        );

    }


    if (
        button
    ) {

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
        !input
        ||
        !suggestions
    ) {

        return;

    }


    const keyword =

        input.value
        .trim()
        .toLowerCase();


    suggestions.innerHTML = "";


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


                    suggestions.innerHTML = "";


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


    if (
        !keyword
    ) {

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


    if (
        !input
    ) {

        return;

    }


    const keyword =

        input.value
        .trim();


    if (
        !keyword
    ) {

        alert(
            "종목명 또는 종목코드를 입력하세요."
        );

        return;

    }


    const stock =

        findStock(
            keyword
        );


    let code = "";


    if (
        stock
    ) {

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


        if (
            !response.ok
        ) {

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


    } catch (error) {


        console.error(
            error
        );


        setApiStatus(
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


    if (
        !data
    ) {

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


    /* 종목명 */

    const stockName =

        document.getElementById(
            "stockName"
        );


    if (
        stockName
    ) {

        stockName.textContent =

            stock
            ?

            stock.name

            :

            data.name
            ||
            "종목";

    }


    /* 종목코드 */

    const stockCode =

        document.getElementById(
            "stockCode"
        );


    if (
        stockCode
    ) {

        stockCode.textContent =

            stock
            ?

            stock.code

            :

            data.code
            ||
            "-";

    }


    /* 현재가 */

    const priceElement =

        document.getElementById(
            "price"
        );


    if (
        priceElement
    ) {

        priceElement.textContent =

            price > 0

            ?

            price.toLocaleString(
                "ko-KR"
            )
            +
            "원"

            :

            "-";

    }


    /* 등락률 */

    const changeElement =

        document.getElementById(
            "change"
        );


    if (
        changeElement
    ) {

        changeElement.textContent =

            change.toFixed(
                2
            )
            +
            "%";

    }


    /* 거래량 */

    const volumeElement =

        document.getElementById(
            "volume"
        );


    if (
        volumeElement
    ) {

        volumeElement.textContent =

            volume.toLocaleString(
                "ko-KR"
            );

    }


    /* 이동평균선 */

    updateMA(
        data
    );


    /* AI 분석 */

    analyzeStock(
        data
    );


    /* 차트 */

    drawChart(
        data
    );


    /* 실전 매매 시스템 */

    updateTradingUI(
        price
    );

}


/* =====================================
   이동평균선 표시
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


    if (
        ma5Element
    ) {

        ma5Element.textContent =

            ma5 > 0

            ?

            Math.round(
                ma5
            )
            .toLocaleString(
                "ko-KR"
            )
            +
            "원"

            :

            "-";

    }


    if (
        ma20Element
    ) {

        ma20Element.textContent =

            ma20 > 0

            ?

            Math.round(
                ma20
            )
            .toLocaleString(
                "ko-KR"
            )
            +
            "원"

            :

            "-";

    }


    if (
        ma60Element
    ) {

        ma60Element.textContent =

            ma60 > 0

            ?

            Math.round(
                ma60
            )
            .toLocaleString(
                "ko-KR"
            )
            +
            "원"

            :

            "-";

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


    let score = 0;


    /* 현재가 > MA5 */

    if (
        price > ma5
        &&
        ma5 > 0
    ) {

        score += 20;

    }


    /* MA5 > MA20 */

    if (
        ma5 > ma20
        &&
        ma20 > 0
    ) {

        score += 20;

    }


    /* MA20 > MA60 */

    if (
        ma20 > ma60
        &&
        ma60 > 0
    ) {

        score += 20;

    }


    /* 상승률 */

    if (
        change > 2
    ) {

        score += 20;

    }


    /* 거래량 */

    if (
        volume > 1000000
    ) {

        score += 20;

    }


    let recommendation = "";


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


    if (
        scoreElement
    ) {

        scoreElement.textContent =

            score
            +
            "점";

    }


    if (
        recommendElement
    ) {

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


    if (
        !canvas
    ) {

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


    if (
        chart
    ) {

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
   실전 매매 상태
===================================== */

let tradingState = {

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

        return;

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


}


/* =====================================
   전량 매도 처리
===================================== */

function tradingSellAll(
    currentPrice
) {


    if (
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


    console.log(
        "전량매도",
        sellShares,
        "주"
    );


    console.log(
        "실현수익",
        profit
    );


    /*
       새로운 사이클 시작
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


    return {

        sellShares,

        sellAmount,

        profit

    };

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
                "🟢 1회차 → 30주 매수"

        };

    }


    /*
       평균매수가 대비 +5%
       전량매도
    */

    if (

        tradingState.targetPrice > 0

        &&

        currentPrice
        >=
        tradingState.targetPrice

    ) {

        return {

            action:
                "SELL_ALL",

            shares:
                tradingState.totalShares,

            message:
                "🔵 평균매수가 +5% → 전량매도"

        };

    }


    /*
       기준가격보다 낮음
       20주 매수
    */

    if (

        currentPrice
        <
        tradingState.basePrice

    ) {

        return {

            action:
                "BUY_20",

            shares:
                20,

            message:
                "🔴 기준가격보다 낮음 → 20주 추가매수"

        };

    }


    /*
       기준가격과 같음
       15주 매수
    */

    if (

        currentPrice
        ===
        tradingState.basePrice

    ) {

        return {

            action:
                "BUY_15",

            shares:
                15,

            message:
                "🟠 기준가격과 같음 → 15주 추가매수"

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
            "⚪ 기준가격보다 높음 → 매수 대기"

    };

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


    const signal =

        getTradingSignal(
            currentPrice
        );


    /*
       현재가
    */

    const currentElement =

        document.getElementById(
            "tradeCurrentPrice"
        );


    if (
        currentElement
    ) {

        currentElement.textContent =

            currentPrice
            .toLocaleString(
                "ko-KR"
            )
            +
            "원";

    }


    /*
       기준가격
    */

    const baseElement =

        document.getElementById(
            "tradeBasePrice"
        );


    if (
        baseElement
    ) {

        baseElement.textContent =

            tradingState.basePrice > 0

            ?

            Math.round(
                tradingState.basePrice
            )
            .toLocaleString(
                "ko-KR"
            )
            +
            "원"

            :

            "-";

    }


    /*
       평균매수가
    */

    const averageElement =

        document.getElementById(
            "tradeAveragePrice"
        );


    if (
        averageElement
    ) {

        averageElement.textContent =

            tradingState.averagePrice > 0

            ?

            Math.round(
                tradingState.averagePrice
            )
            .toLocaleString(
                "ko-KR"
            )
            +
            "원"

            :

            "-";

    }


    /*
       보유주식
    */

    const sharesElement =

        document.getElementById(
            "tradeShares"
        );


    if (
        sharesElement
    ) {

        sharesElement.textContent =

            tradingState.totalShares
            .toLocaleString(
                "ko-KR"
            )
            +
            "주";

    }


    /*
       목표매도가
    */

    const targetElement =

        document.getElementById(
            "tradeTargetPrice"
        );


    if (
        targetElement
    ) {

        targetElement.textContent =

            tradingState.targetPrice > 0

            ?

            Math.round(
                tradingState.targetPrice
            )
            .toLocaleString(
                "ko-KR"
            )
            +
            "원"

            :

            "-";

    }


    /*
       매매신호
    */

    const signalElement =

        document.getElementById(
            "tradeSignal"
        );


    if (
        signalElement
    ) {

        signalElement.textContent =

            signal.message;

    }


    /*
       다음 매수수량
    */

    const nextBuyElement =

        document.getElementById(
            "nextBuyShares"
        );


    if (
        nextBuyElement
    ) {

        nextBuyElement.textContent =

            signal.shares > 0

            ?

            signal.shares
            +
            "주"

            :

            "없음";

    }


    /*
       매도 예정수량
    */

    const sellElement =

        document.getElementById(
            "sellShares"
        );


    if (
        sellElement
    ) {

        sellElement.textContent =

            signal.action
            ===
            "SELL_ALL"

            ?

            tradingState.totalShares
            +
            "주"

            :

            "0주";

    }

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


    if (
        element
    ) {

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


    if (
        element
    ) {

        element.textContent =
            message;

    }

}
