/* =====================================
   실전 매매 전략 V1
   30주 시작
   기준가보다 낮음 → 20주
   기준가와 같음 → 15주
   기준가보다 높음 → 매수 없음
   평균가 +5% → 전량 매도
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
   평균매수가 계산
===================================== */

function calculateAveragePrice() {

    if (
        tradingState.totalShares <= 0
    ) {

        tradingState.averagePrice = 0;

        return;

    }


    tradingState.averagePrice =

        tradingState.totalCost
        /
        tradingState.totalShares;

}


/* =====================================
   목표 매도가 계산
===================================== */

function calculateTargetPrice() {

    tradingState.targetPrice =

        tradingState.averagePrice
        *
        1.05;

}


/* =====================================
   실전 매매 판단
===================================== */

function getTradingSignal(
    currentPrice
) {


    /* -----------------------------
       첫 거래
    ----------------------------- */

    if (
        !tradingState.started
    ) {


        return {

            action:
                "FIRST_BUY",

            shares:
                30,

            message:
                "첫 거래 → 30주 매수"

        };

    }



    /* -----------------------------
       매도 판단
       평균매수가 +5%
    ----------------------------- */

    if (

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
                "목표수익률 +5% → 전량 매도"

        };

    }



    /* -----------------------------
       기준가격보다 낮음
       20주 매수
    ----------------------------- */

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
                "기준가격보다 낮음 → 20주 추가매수"

        };

    }



    /* -----------------------------
       기준가격과 같음
       15주 매수
    ----------------------------- */

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
                "기준가격과 같음 → 15주 추가매수"

        };

    }



    /* -----------------------------
       기준가격보다 높음
       매수 없음
    ----------------------------- */

    return {

        action:
            "WAIT",

        shares:
            0,

        message:
            "기준가격보다 높음 → 매수하지 않음"

    };

}



/* =====================================
   매수 처리
===================================== */

function executeBuy(
    currentPrice,
    shares
) {


    const cost =

        currentPrice
        *
        shares;


    tradingState.totalCost +=

        cost;


    tradingState.totalShares +=

        shares;


    tradingState.started =

        true;


    /* 평균가격 계산 */

    calculateAveragePrice();


    /* 평균가를 새로운 기준가격 */

    tradingState.basePrice =

        tradingState.averagePrice;


    /* 목표가 계산 */

    calculateTargetPrice();


}



/* =====================================
   전량 매도 처리
===================================== */

function executeSell(
    currentPrice
) {


    const shares =

        tradingState.totalShares;


    const sellAmount =

        currentPrice
        *
        shares;


    const profit =

        sellAmount
        -
        tradingState.totalCost;



    console.log(
        "전량매도",
        shares,
        "주"
    );


    console.log(
        "매도금액",
        sellAmount
    );


    console.log(
        "실현수익",
        profit
    );



    /* -----------------------------
       새로운 사이클 시작 준비
    ----------------------------- */

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

        sellAmount,

        profit

    };

}



/* =====================================
   실전 매매 실행
===================================== */

function processTrading(
    currentPrice
) {


    const signal =

        getTradingSignal(
            currentPrice
        );


    console.log(
        "현재가:",
        currentPrice
    );


    console.log(
        "기준가격:",
        tradingState.basePrice
    );


    console.log(
        "평균매수가:",
        tradingState.averagePrice
    );


    console.log(
        "목표매도가:",
        tradingState.targetPrice
    );


    console.log(
        "매매판단:",
        signal.message
    );



    /* -----------------------------
       첫 매수
    ----------------------------- */

    if (

        signal.action
        ===
        "FIRST_BUY"

    ) {


        executeBuy(

            currentPrice,

            30

        );

    }



    /* -----------------------------
       20주 매수
    ----------------------------- */

    else if (

        signal.action
        ===
        "BUY_20"

    ) {


        executeBuy(

            currentPrice,

            20

        );

    }



    /* -----------------------------
       15주 매수
    ----------------------------- */

    else if (

        signal.action
        ===
        "BUY_15"

    ) {


        executeBuy(

            currentPrice,

            15

        );

    }



    /* -----------------------------
       전량 매도
    ----------------------------- */

    else if (

        signal.action
        ===
        "SELL_ALL"

    ) {


        executeSell(

            currentPrice

        );

    }



    return signal;

}
