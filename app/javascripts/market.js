// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/market.css";
// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import User_artifacts from '../../smartcontract/build/contracts/User.json'
import UserList_artifacts from '../../smartcontract/build/contracts/UserList.json'
import Market_artifacts from '../../smartcontract/build/contracts/Market.json'

// User UserList Market ContractAddress is our usable abstraction, which we'll use through the code below.
var User = contract(User_artifacts);
var UserList = contract(UserList_artifacts);
var Market = contract(Market_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;
let rowseq;
let first_click = 0;

var user_instance;
var market_instance;

var global_market_id;//全局行情id

window.App = {
  start: function() {
    var self = this;
    User.setProvider(web3.currentProvider);
    UserList.setProvider(web3.currentProvider);
    Market.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];

   //   self.refreshBalance();
    });
    UserList.deployed().then(function(instance){
        var meta = instance;
        var user_id = "User";
        console.log(meta);
        //获取user合约地址
        var process = meta.getUserInfo.call(user_id);
        process.then(function(argv){
            var user_addr = argv[1];
            //调用user.listrequest
            console.log("listrequest user_addr:"+user_addr.toString());
            User.at(user_addr).then(function(instance){
                console.log(instance);
                user_instance = instance;
            });

        });
     });
    Market.deployed().then(function(instance){
        //获取Market地址
       market_instance = instance;
       console.log(market_instance);
       market_instance.getMarketID.call().then(function(ret){
            console.log("页面刷新Start global_market_id:"+ret);
            global_market_id = ret;
       });
       self.listMarket();
       setInterval(self.syncMaket,5000); 
    });
  },

  //检查market_id改变时，进行同步
  syncMaket: function(){
      market_instance.getMarketID.call().then(function(ret){
            console.log("Now MarketID:"+ret);
            console.log("global_market_id:"+global_market_id);
            if (ret > global_market_id)
            {
               var behind = ret - global_market_id;
               console.log("behind:"+behind);
               while (behind > 0)
               {
                    App.eventTrigger();
                    behind--;
                    global_market_id++;
               }
            }
      });
  },
  //刷新市场行情
  listMarket: function(){
      var self = this;
      //检查实例
      console.log(market_instance);
      //获取市场行情数量
      var promise_num = market_instance.getMarketNum.call();
      
      promise_num.then(function(num){
        console.log("Market num:"+num);
      if (num != 0)
      {
            for (var index = 1; index <= num; index++)
            {
              var market_id;
              var date;
              var sheet_id;
              var class_id;
              var make_date;
              var lev_id;
              var whe_id;
              var place_id;
              var price;
              var user_id;
              var list_qty;
              var deal_qty;
              var rem_qty;
              var dead_line;
              var dlv_uint;
              var seller_addr;
              console.log("开始第"+index+"轮");
              market_instance.getMarketStr_1.call(index).then(function(ret){
                      console.log(index+" getMarketStr_1 date:"+ret[0]);
                      //时间转换*s到yyyymmdd
                      /*
                      var date = new Date();
                      date.setTime(ret[0]);
                      console.log(date.toDateString());
                      var year = date.getFullYear();
                      console.log("Year:"+year);
                      */
                      date = ret[0];
                      console.log(index+" getMarketStr_1 marketID:"+ret[1]);
                      market_id = ret[1];
                      console.log("getMarketStr_1 sheet_id:"+ret[2]);
                      sheet_id = ret[2];
                      console.log("getMarketStr_1 class_id:"+ret[3]);
                      class_id = ret[3];
                      console.log("getMarketStr_1 make_date:"+ret[4]);
                      make_date = ret[4];
                      console.log("getMarket_1 lev_id:"+ret[5]);
                      lev_id = ret[5];
                      console.log("getMarket_1 wh_id:"+ret[6]);
                      whe_id = ret[6];
                      console.log("getMarketStr_1 place_id:"+ret[7]);
                      place_id = ret[7];
                      console.log("getMarketStr_1 执行完!!!"+index);
                });    

            market_instance.getMarketStr_2.call(index).then(function (result){
                    price = result[0];
                    console.log("getMarket_2 price:"+result[0]);
                    list_qty = result[1];
                    console.log("getMarket_2 listqty:"+ result[1]);
                    deal_qty = result[2];
                    console.log("getMarket_2 deal_qty:"+result[2]);
                    rem_qty = result[3];
                    console.log("getMarket_2 rem_qty:"+result[3]);
                    dead_line = result[4];
                    console.log("getMarket_2 dealine:"+result[4]);
                     dlv_uint = result[5];
                    console.log("getMarket_2 dlv_uint:"+result[5]);
                     user_id = result[6];
                    //记住bytes32ToString转换
                    console.log("getMarket_2 user_id:"+result[6]);
                    seller_addr = result[7];
                    console.log("getMarket_2 seller_addr:"+result[7]);
                    console.log("getMarketStr_2执行完!!!"+index);
                 App.addTr(date,market_id, sheet_id, class_id, make_date, lev_id,whe_id, place_id, "yikoujia",price, list_qty, deal_qty, rem_qty, dead_line,dlv_uint);
            });
            
          }//for
     }//if
    });
      
  },

  //<挂单.Userid写死
  listRequests: function(){
    var self = this;
    //获取内容
    var sheet_id = parseInt(document.getElementById("textfield0").value);
    console.log("sheet_id:"+sheet_id);
    var sheet_price=parseInt(document.getElementById("textfield1").value);
    console.log("sheet_price:"+sheet_price);
    var sheet_amount = parseInt(document.getElementById("textfield2").value);
    console.log("sheet_amount:"+sheet_amount);
   
    var dead_line = document.getElementById("textfield3").value;
    console.log("dead_line:"+dead_line);
   
    user_instance.listRequest.sendTransaction("User",sheet_id, sheet_price, sheet_amount,{from:account, gas:9000000}).then(function(ret){
                console.log("marktet_transactionHash:"+ret);
                self.eventTrigger();
                global_market_id++;
            }); //user_instance
  },
  eventTrigger:function(){
    var self =this;
    console.log("eventTrigger !!!!");
    var onlyone = 0;
    var event = market_instance.getRet(function(error, result){
                    if (!error && !onlyone)
                    {
                        onlyone++;
                        console.log("listRequest retMarketid:"+result.args.ret);
                        var retMarketid = result.args.ret;
                        if (retMarketid != -1)
                        {
                        //获取市场行情 
                        var market_id;
                        var date;
                        var sheet_id;
                        var class_id;
                        var make_date;
                        var lev_id;
                        var whe_id;
                        var place_id;
                        var price;
                        var list_qty;
                        var deal_qty;
                        var rem_qty;
                        var dead_line;
                        var dlv_uint;
                        var user_id;
                        var seller_addr;
                    market_instance.getMarketStr_1.call(retMarketid).then(function(ret){
                                    date = ret[0];
                                    market_id = ret[1];
                                    sheet_id = ret[2];
                                    class_id = ret[3];
                                    make_date = ret[4];
                                    lev_id = ret[5];
                                    whe_id = ret[6];
                                    place_id = ret[7];
                          market_instance.getMarketStr_2.call(retMarketid).then(function(ret){
                                    price = ret[0];
                                    list_qty = ret[1];
                                    deal_qty = ret[2];
                                    rem_qty = ret[3];
                                    dead_line = ret[4];
                                    dlv_uint = ret[5];
                                    user_id = ret[6];

                                    App.addTr(date, market_id, sheet_id, class_id,make_date, lev_id, whe_id, place_id, "yikoujia", price, list_qty,deal_qty, rem_qty, dead_line, dlv_uint);
                                    }); 
                          });
                    }//if(retMarketid != -1)
                    }//if (!error)
       });//event
    
  },
  //<获取MarketID,UserId写死
  getMarktID: function(){
        UserList.deployed().then(function (instance){
           var user_id = "User";
           var process = instance.getUserInfo.call(user_id);
           process.then(function (argv){
                usr_addr = argv[1];
                console.log("getMarket user_id:"+user_id);
                var market_id = User.at(user_addr.toString()).getMarketID.call();
                console.log("getMakrt market_id:"+market_id);
           }); 
        });
    },
    
   myList: function(){
        document.getElementById("listReceipt").style.display="block";
        document.getElementById("myTrade").style.display="none";
        document.getElementById("myReceipt").style.display="none";
        var table = document.getElementById("taReceipt");
        //每次点击都会清空tbody
        var tBody = table.tBodies[0];
        tBody.parentNode.outerHTML = tBody.parentNode.outerHTML.replace(tBody.innerHTML, "");  
        
        //创建table元素
        var tr = document.createElement('tr');
        var td_opt = document.createElement('td');
        td_opt.innerHTML = "操作";
        tr.appendChild(td_opt);

        var td_id = document.createElement('td');
        td_id.innerHTML= "委托编号";
        tr.appendChild(td_id);

        var td_date = document.createElement('td');
        td_date.innerHTML = "交易日期";
        tr.appendChild(td_date);

        var td_classid = document.createElement('td');
        td_classid.innerHTML = "品种";
        tr.appendChild(td_classid);

        var td_makedate = document.createElement('td');
        td_makedate.innerHTML="产期";
        tr.appendChild(td_makedate);

        var td_lev = document.createElement('td');
        td_lev.innerHTML = "等级";
        tr.appendChild(td_lev);

        var td_buyOrsell = document.createElement('td');
        td_buyOrsell.innerHTML= "买卖";
        tr.appendChild(td_buyOrsell);

        var td_price = document.createElement("买卖");
        td_price.innerHTML = "价格";
        tr.appendChild(td_price);

        var td_amount = document.createElement("td");
        td_amount.innerHTML = "挂牌量";
        tr.appendChild(td_amount);

        var td_remainAmount = document.createElement('td');
        td_remainAmount.innerHTML = "剩余量";
        tr.appendChild(td_remainAmount);

        var td_dealAmount = document.createElement('td');
        td_dealAmount.innerHTML = "成交量";
        tr.appendChild(td_dealAmount);

        var td_deadline = document.createElement('td');
        td_deadline.innerHTML = "挂单到期日";
        tr.appendChild(td_deadline);

        table.tBodies[0].appendChild(tr);
        
    },

    myTrade :function(){
       //获取table实例
       document.getElementById("myTrade").style.display="block";
       document.getElementById("listReceipt").style.display="none";
       document.getElementById("myReceipt").style.display="none";
       //获取table实例
       var table = document.getElementById("taTrade");
    },

    myReceipt:function(){
      var self = this;
      document.getElementById("myReceipt").style.display="block";
      document.getElementById("myTrade").style.display="none";
      document.getElementById("listReceipt").style.display="none";
      var table = document.getElementById("taMyReceipt");
      //每次点击都会清空tbody
      var tBody = table.tBodies[0];
      tBody.parentNode.outerHTML = tBody.parentNode.outerHTML.replace(tBody.innerHTML, "");  
      //数据参数
      var user_id = "User";
      var sheet_id;
      var class_id;
      var make_date;
      var lev_id;
      var whe_id;
      var place_id;
      var all_amount;
      var avail_amount;
      var frozen_amount;
      //获取map长度
      user_instance.getSheetMapNum.call().then(function(len){
              console.log("sheetMap len:"+len);
              for (var index = 0; index < len; index++)
              {
                 user_instance.getSheetMap_1.call(index).then(function(result){
                             sheet_id = result[1];
                             console.log("class_id:"+result[2]);
                             class_id = result[2];
                             console.log("make_date:"+result[3]);
                             make_date = result[3];
                             console.log("lev_id:"+result[4]);
                             lev_id = result[4];
                             console.log("whe_id:"+result[5]);
                             whe_id = result[5];
                             console.log("place_id:"+result[6]);
                             place_id = result[6];
                         });      
                 user_instance.getSheetMap_2.call(index).then(function(result){
                             all_amount = result[0];
                             console.log("all_amount:"+all_amount);
                             avail_amount = result[1];
                             console.log("avail_amount:"+avail_amount);
                             frozen_amount = result[2];
                             console.log("frozen_amount:"+frozen_amount);
                             self.addmyReceipt(user_id, sheet_id, class_id, make_date, lev_id, whe_id, place_id, all_amount, avail_amount, frozen_amount);
                                 });
   }
    });      
  },
    //填充taReceipt表
    //参数：委托编号(挂单编号),委托日期(挂单日期),等级,产期,等级,买卖,价格,挂牌量,剩余量,成交量,挂牌到期日
    addListReceipt: function(market_id, trade_date,class_id, make_date, lev_id, buyorsell, price, list_qty, rem_qty, deal_qty, dead_line){
      
    }, 

    //填充taTrade表
    //参数：合同日期, 合同编号, 仓单编号, 买卖, 价格, 合同量, 手续费, 已拨货款, 剩余货款, 己方id, 对手方id, 交收状态, 交易方式
    addmyTrade: function(trade_date, trade_id, sheet_id, buyorsell, price, trade_qty, fee, trans_money, rem_money, user_id, opp_id, trade_state, trade_type){
    },

    //填充taMyReceipt
    //参数: 用户id, 仓单序号, 品种id, 产期, 等级, 仓库代码, 产地代码, 仓单总量, 可用数量, 冻结数量
    addmyReceipt: function(user_id, sheet_id, class_id, make_date, lev_id, whe_id, place_id, all_amount, available_amount, frozen_amount){
       var table = document.getElementById("taMyReceipt");
       var tr = document.createElement('tr');
       //插入用户id
       var td_userid = document.createElement('td');
       td_userid.innerHTML = user_id;
       tr.appendChild(td_userid);

       //插入仓单序号
       var td_sheetid = document.createElement('td');
       td_sheetid.innerHTML = sheet_id;
       tr.appendChild(td_sheetid);

       var td_classid = document.createElement('td');
       td_classid.innerHTML = class_id;
       tr.appendChild(td_classid);

       var td_makedate = document.createElement('td');
       td_makedate.innerHTML=make_date;
       tr.appendChild(td_makedate);
       
       var td_levid = document.createElement('td');
       td_levid.innerHTML = lev_id;
       tr.appendChild(td_levid);

       var td_whid = document.createElement('td');
       td_whid.innerHTML = whe_id;
       tr.appendChild(td_whid);

       var td_placeid = document.createElement('td');
       td_placeid.innerHTML = place_id;
       tr.appendChild(td_placeid);

       var td_allamount=document.createElement('td');
       td_allamount.innerHTML=all_amount;
       tr.appendChild(td_allamount);

       var td_availamount = document.createElement('td');
       td_availamount.innerHTML = available_amount;
       tr.appendChild(td_availamount);

       var td_frozenamount = document.createElement('td');
       td_frozenamount.innerHTML=frozen_amount;
       tr.appendChild(td_frozenamount);
       table.tBodies[0].appendChild(tr);
    },
    //<填充市场行情表单
	addTr: function(date,market_id, sheet_id, class_id, mkdate, lev, whe_id, place_id, price_type, price, list_qty, deal_qty, rem_qty, deadline, dlv_uint){

     //获取table实例
     var table = document.getElementById("addRow");
     //定义行元素
     var tr = document.createElement('tr');
     //插入index
     var td_index = document.createElement('td');
     td_index.innerHTML = rowseq++;
     td_index.setAttribute("text-align", "center");
     tr.appendChild(td_index);

     //插入date
     var td_date = document.createElement('td');
     /*
     var now = new Date();
     var year = now.getFullYear();
     var month = now.getMonth();
     var day = now.getDate();
     var time = year;
     if(month < 10)
             time += "0";
     time +=month;
     if (day < 10)
             time += "0";
     time += day;
     td_date.innerHTML = time;
     */
     td_date.innerHTML = date;
     tr.appendChild(td_date);

     //插入market_id
     var td_list_id = document.createElement('td');
     td_list_id.innerHTML = market_id;
     tr.appendChild(td_list_id);

     //插入 sheet_id
     var td_sheet_id = document.createElement('td');
     td_sheet_id.innerHTML = sheet_id;
     tr.appendChild(td_sheet_id);

     //插入class_id
     var td_class_id = document.createElement('td');
     td_class_id.innerHTML = class_id;
     tr.appendChild(td_class_id);

     //插入mkdate
     var td_mkdate = document.createElement('td');
     td_mkdate.innerHTML = mkdate;
     tr.appendChild(td_mkdate);

     //插入lev
     var td_lev = document.createElement('td');
     td_lev.innerHTML = lev;
     tr.appendChild(td_lev);

     //插入whe_id
     var td_whe_id = document.createElement('td');
     td_whe_id.innerHTML = whe_id;
     tr.appendChild(td_whe_id);

     //插入place_id
     var td_place_id = document.createElement('td');
     td_place_id.innerHTML = place_id;
     tr.appendChild(td_place_id);

     //插入price_type
     var td_price_type = document.createElement('td');
     td_price_type.innerHTML= price_type;
     tr.appendChild(td_price_type);

     //掺入price
     var td_price = document.createElement('td');
     td_price.innerHTML = price;
     tr.appendChild(td_price);

     //插入list_qty
     var td_list_qty = document.createElement('td');
     td_list_qty.innerHTML = list_qty;
     tr.appendChild(td_list_qty);

     //插入deal_qty
     var td_deal_qty = document.createElement('td');
     td_deal_qty.innerHTML = deal_qty;
     tr.appendChild(td_deal_qty);

     //插入rem_qty
     var td_rem_qty = document.createElement('td');
     td_rem_qty.innerHTML = rem_qty;
     tr.appendChild(td_rem_qty);

     //插入dealine
     var td_deadline = document.createElement('td');
     td_deadline.innerHTML = deadline;
     tr.appendChild(td_deadline);

     //插入dlv_uint
     var td_dlv_uint = document.createElement('td');
     td_dlv_uint.innerHTML = dlv_uint;
     tr.appendChild(td_dlv_uint);
     table.tBodies[0].appendChild(tr);
  }	
};

window.addEventListener('load', function() {
    rowseq = 0;
    console.log("load !!!");
	rowseq = document.getElementById("addRow").tBodies[0].rows.length + 1; 
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)

  if (typeof web3 !== 'undefined') {
    console.log('out string:');
    console.log(web3);

    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
//    window.web3 = new Web3(new Web3.providers.HttpProvider("http://192.168.22.47:8545"));
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://192.168.22.123:8545"));
  }
  App.start(); 
});

