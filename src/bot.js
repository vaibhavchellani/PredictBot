const Bot = require('./lib/Bot')
const SOFA = require('sofa-js')
const Fiat = require('./lib/Fiat')
var firebase = require("firebase");
let bot = new Bot()

var config = {
    apiKey: "AIzaSyBKBW9lArpUxIqK2vxp-0TggWqHzodd-5o",
    authDomain: "iitd-9df28.firebaseapp.com",
    databaseURL: "https://iitd-9df28.firebaseio.com",
    projectId: "iitd-9df28",
    storageBucket: "iitd-9df28.appspot.com",
    messagingSenderId: "759230086656"
};
firebase.initializeApp(config);
// Get a reference to the database service
var database = firebase.database();



// ROUTING

bot.onEvent = function(session, message) {
    switch (message.type) {
        case 'Init':
            welcome(session)
            break
        case 'Message':
            onMessage(session,message)
            break
        case 'Command':
            onCommand(session, message)
            break
        case 'Payment':
            onPayment(session, message)
            break
        case 'PaymentRequest':
            welcome(session)
            break
    }
}
function secondQuestion(session, message) {
    console.log("second")
    session.set('createMarketStep',2)

    session.reply("Enter the question you want to ask users when the enter the market ?")
}
function thirdQuestion(session, message) {
    console.log("third")
    session.set('createMarketStep',3)

    session.reply("How long will this market last  ?")
}
function fourth(session,message) {
    session.reply("Congratulations market created  !!")
}
function onMessage(session, message) {
    var isnum = /^\d+$/.test(message.body);
    if(isnum)
    {   console.log('message   '+JSON.stringify(message, null, 4))
        applyBetGDP(message.fromAddress,message.body,session)
        session.set('createMarket',false)
    }
    /*if(session.get('createMarket')==true)
    {
        if(session.get('createMarketStep')==1)
        {
            console.log('on message step 1')
            session.set('createMarketName',message.body)

            session.set('createMarket',true)

            secondQuestion(session,message)


        }
        if(session.get('createMarketStep')==2)
        {
            console.log('on message step 2')
            session.set('createMarketQuestion',message.body)
            session.set('createMarket',true)
            thirdQuestion(session,message)
        }
        if(session.get('createMarketStep')==3)
        {
            console.log('on message step 3')
            session.set('createMarket',false)

            console.log(session.get('createMarketName')+" "+session.get('createMarketQuestion')+" "+message.body)

            fourth(session,message)
            // do firebase thing and add controls
        }

        session.set('createMarket',false)
    }
*/
    else if(session.get('from')=='step1'){
        console.log(message.body)
        session.set('marketName',message.body)
        step2(session)
    }
    else if(session.get('from')=='step2'){
        console.log(message.body)
        session.set('from',null)
        session.set('marketQuestion',message.body)
        step3(session)
    }
    else if(session.get('from')=='step3'){
        console.log(message.body)
        step2(session)
    }


    else {
        welcome(session)
        session.set('createMarket',false)
    }

}
function step1(session) {
    session.set('from','step1')
    session.reply(SOFA.Message({
        body:  "Let's get started , Enter the name of market",

    }))
}

function step2(session) {
    session.set('from','step2')
    session.reply(SOFA.Message({
        body:  "Now you're on step 2 , Please enter the question for the market .",

    }))
}

function step3(session) {
    session.reply(SOFA.Message({
        body:  "One more , Please select the duration of market ",
        controls: [
            {type: "button", label: "1 day", value: "1 day"},
            {type: "button", label: "2 day", value: "2 day"},
            {type: "button", label: "3 day", value: "3 day"}
        ]
    }))
}

function step4(session,command) {
    console.log(command)
    //add to firebase
    database.ref(session.get('marketName')).set({
        market_question:session.get('marketQuestion'),
        market_time:command.value
    });
    session.reply(SOFA.Message({
        body:  "Congratulations market successfully created ",
        controls: [
            {type: 'button', label: 'Governament Bills', value: 'govtDomain'},
            {type: 'button', label: 'Create Your Prediction Market', value: 'createMarket'},
            {type: 'button', label: 'View Current Markets', value: 'viewMarkets'},
            //option to create your own prediction market
        ]
    }))
    session.requestEth(1, "For creating market ");
}

function onCommand(session, command) {
    switch (command.content.value) {
        case 'govtDomain':
            govtDomain(session)
            break
        case '1':
            session.set('bill-no',1)
            GDP(session)
            break
        case '2':
            session.set('bill-no',2)
            GDP(session)
            break
        case 'increase':
            BetGDP(session,'increase')
            break
        case 'decrease':
            BetGDP(session,'decrease')
            break
        case 'financeBills':
            financeBills(session)
            break
        case 'GDPPayout':
            payoutGDP(session,command)
            break
        case 'createMarket':
            step1(session)
            break
        case "step1":
            step1(session)
            break
        case "step2":
            step2(session)
            break
        case "step3":
            step3(session)
            break
        case "step4":
            step4(session)
            break
        case "1 day":
            step4(session,command)
            break
        case "2 day":
            step4(session,command)
            break
        case "3 day":
            step4(session,command)
            break
        case "viewMarkets":
            viewMarkets(session)
            break
    }
}

function onPayment(session, message) {
    if(session.get('market')=='finance')
    {   //need market ,amount, prediction,address
        if(session.get('bill-no')=='1')
        {
            var newPostRef = database.ref('finance/bill-no-1').push();
            newPostRef.set({
                amount_bet:message.value.toString(),
                address:message.fromAddress,
                bet_on:session.get('bet-on')
            });

            session.set('bill-no',0)
            session.set('bet-on',null)
            session.set('market',null)

        }
        if(session.get('bill-no')=='2')
        {


            var newPostRef = database.ref('finance/bill-no-1').push();
            newPostRef.set({
                amount_bet:message.value.toString(),
                address:message.fromAddress,
                bet_on:session.get('bet-on')
            });
            session.set('bill-no',0)
            session.set('bet-on',null)
            session.set('market',null)
        }
    }
    if (message.fromAddress == session.config.paymentAddress) {
        // handle payments sent by the bot
        if (message.status == 'confirmed') {
            // perform special action once the payment has been confirmed
            // on the network
        } else if (message.status == 'error') {
            // oops, something went wrong with a payment we tried to send!
        }
    } else {
        // handle payments sent to the bot
        if (message.status == 'unconfirmed') {
            // payment has been sent to the ethereum network, but is not yet confirmed
            sendMessage(session, `Thanks for the payment! 🙏`);
        } else if (message.status == 'confirmed') {
            // handle when the payment is actually confirmed!
        } else if (message.status == 'error') {
            sendMessage(session, `There was an error with your payment!🚫`);
        }
    }
}

// STATES

function welcome(session) {

    welcomeMessage(session, `Hey there ! Welcome to PredictBot , to start predicting choose from the following domains , you can also create your own prediction market `)
}

// example of how to store state on each user
function payoutGDP(session,command) {
    //get no amount riding on increase and decrease
    if(session.get('bill-no')==1)
    {
        billno="bill-no-1"
    }
    if(session.get('bill-no')==2)
    {
        billno="bill-no-2"
    }
    increase_count=0
    decrease_count=0
    increase_money=0
    decrease_money=0
    session.set('GDPincrease_count',0)
    session.set('GDPdecrease_count',0)
    session.set('GDPincrease_money',0)
    session.set('GDPdecrease_money',0)
    var ref=database.ref('finance/'+billno.toString()+'/')
    ref.once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            var childKey = childSnapshot.key;
            var childData = childSnapshot.val();
            if(childData.bet_on=='increase')
            {
                this.increase_count++;
                //this.session.set('GDPincrease_count',increase_count++)
                increase_money+=childData.amount_bet;
                console.log("inside increase")
                console.log(session.get('GDPincrease_count'))
            }
            if(childData.bet_on=='decrease')
            {
                decrease_count++;
                decrease_money+=childData.amount_bet;

            }

        });
    });



    let controls = [
        {type: 'button', label: 'GDP will increase ', value: 'increase'},
        {type: 'button', label: 'GDP will decrease', value: 'decrease'},
        {type: 'button', label: 'View Payouts', value: 'GDPPayout'},


    ]
    session.reply(SOFA.Message({
        body: session.get('GDPincrease_count').toString()+' people have betted amount '+increase_money.toString(),
        controls: controls,
        showKeyboard: false,
    }))
}
function govtDomain(session) {
    let controls = [
        {type: 'button', label: 'Finance/Economic Bills', value: 'financeBills'},
        {type: 'button', label: 'null', value: ''},
    ]
    session.reply(SOFA.Message({
        body: 'Please select the domain of your expertise to place bets on it ',
        controls: controls,
        showKeyboard: false,
    }))
}

function financeBills(session) {
    let controls = [
        {type: 'button', label: 'Bill NO : 1', value: '1'},
        {type: 'button', label: 'Bill NO : 2', value: '2'},
        {type: 'button', label: 'null', value: '3'},

    ]
    session.reply(SOFA.Message({
        body: ' The following bills are taken from (http://www.prsindia.org/billtrack/industry-commerce-finance) and are in pending state , the duration of market is 3 minutes  , please select the bill you want to bet on from the options below : ' +
        '1. The Financial Resolution and deposit insurance Bill , 2017'+
        '2. The Consumer Protection Bill, 2017 ',
        controls: controls,
        showKeyboard: false,
    }))
}
function GDP(session) {
    let controls = [
        {type: 'button', label: 'GDP will increase ', value: 'increase'},
        {type: 'button', label: 'GDP will decrease', value: 'decrease'},
        {type: 'button', label: 'View Payouts', value: 'GDPPayout'},
        

    ]
    session.reply(SOFA.Message({
        body: 'What do you predict , if this bill becomes a law , will the overall GDP increase or decrease ??',
        controls: controls,
        showKeyboard: false,
    }))
}

function BetGDP(session ,variable) {
    session.set('market','finance')

    if(variable=='increase'){
        //ask user how much to bet and push his address , amount , market to firebase)
        session.set('bet-on','increase')
        session.reply("Please enter the amount you want to bet ")

    }else{
        session.set('bet-on','decrease')
        session.reply("Please enter the amount you want to bet ")
    }
}
function applyBetGDP(address,amount,session) {
    session.requestEth(amount, "Amount to bet on market "+session.get('market'));

}

function donate(session) {
    // request $1 USD at current exchange rates
    Fiat.fetch().then((toEth) => {
        session.requestEth(toEth.USD(1))
})
}

// HELPERS  

function welcomeMessage(session, message) {
    let controls = [
        {type: 'button', label: 'Governament Bills', value: 'govtDomain'},
        {type: 'button', label: 'Create Your Prediction Market', value: 'createMarket'},
        {type: 'button', label: 'View Current Markets', value: 'viewMarkets'},
        //option to create your own prediction market
    ]
    session.reply(SOFA.Message({
        body: message,
        controls: controls,
        showKeyboard: false,
    }))
}
function sendMessage(session, message) {
    let controls = [
        {type: 'button', label: 'Governament Bills', value: 'govtDomain'},
        {type: 'button', label: 'Create Your Prediction Market', value: 'createMarket'},
        {type: 'button', label: 'View Current Markets', value: 'viewMarkets'},
        //option to create your own prediction market
    ]
    session.reply(SOFA.Message({
        body: message,
        controls: controls,
        showKeyboard: false,
    }))
}
function createMarket(session,command) {
    session.set('createMarket',true)
    session.set('createMarketStep',1)
    session.reply("What do you want to name your market ?")
}
function getMarketVariables(session,message) {
    console.log(session.get('createMarketStep'))
    if(session.get('createMarketStep')==1)
    {
        console.log(message.body)
        session.set('createMarketName',message.body)
        console.log("here")

        session.set('createMarket',true)
        session.reply("Enter the question you want to ask users when the enter the market ?")
        session.set('createMarketStep',2)

    }
    if(session.get('createMarketStep')==2)
    {

        session.set('createMarketQuestion',message.body)
        session.set('createMarketStep',3)
        session.set('createMarket',true)
        session.reply("How long will this market last  ?")
    }
    if(session.get('createMarketStep')==3)
    {
        session.set('createMarket',false)

        console.log(session.get('createMarketName')+" "+session.get('createMarketQuestion')+" "+message.body)

        session.reply("Congratulations market created  !!")
        // do firebase thing and add controls
    }
}


function viewMarkets(session){
    var ref=database.ref('/')
    ref.once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            var childKey = childSnapshot.key;
            var childData = childSnapshot.val();
            let controls = [
                {type: 'button', label: 'Governament Bills', value: 'govtDomain'},
                {type: 'button', label: 'Create Your Prediction Market', value: 'createMarket'},
                {type: 'button', label: 'View Current Markets', value: 'viewMarkets'},
                //option to create your own prediction market
            ]
            session.reply(SOFA.Message({
                body: message,
                controls: controls,
                showKeyboard: false,
            }))
        });
    });

}

function handleOnMessage(session, message) {
    sendMessage(session,'I am sorry I was not able to understand you , please choose from the buttons , I am still under development')
}