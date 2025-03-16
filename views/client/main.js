import $ from "https://cdn.skypack.dev/jquery@3.6.0";
let server = "wss://{node_server}.herokuapp.com/";
let timeup = null;
let timer = null;
let state = "defused";
let btndown = null;
let defuse_timer = null;
let plant_timer = null;
const second = 1000,
      minute = second * 60,
      hour = minute * 60,
      day = hour * 24;

let ws = new WebSocket(server);
ws.addEventListener("open", () =>{
  console.log("Connected to server");
});

ws.addEventListener("close", () =>{
  console.log("Disconnected from server");
});

ws.addEventListener('message', function (event) {
  var new_state = JSON.parse(event.data)['message'];
  console.log(`Server sent: ${new_state}`);
  setState(new_state, false);
});

function setState(newState, broadcast=true) {
  state = newState;
  if (broadcast == true) {
    ws.send(state);
  }
  if (state == "planted") {
    $('#player1').get(0).currentTime = 0;
    $('#player1').get(0).play();
    $('#player3').get(0).currentTime = 0;
    $('#player3').get(0).play();
    if (broadcast == false) {
      document.getElementById("headline").innerText = "The other bomb is planted";
      document.getElementById("seconds-li").style.display = "none";
      document.getElementById("btn-li").style.display = "none";
      document.getElementById("btn").style.display = "none";
    } else {
      document.getElementById("headline").innerText = "Bomb is planted";
      document.getElementById("seconds-li").style.display = "block";
      document.getElementById("btn-li").style.display = "block";
      document.getElementById("btn").style.display = "block";
      document.getElementById("btn").innerText = "DEFUSE";
      timeup = new Date();
      timeup.setSeconds(timeup.getSeconds() + 41);

      timer = setInterval(function() {    
        var now = new Date().getTime();
        var distance = timeup - now;
        document.getElementById("seconds").innerText = Math.floor((distance % (minute)) / second);

        if (distance < 0) {
          clearInterval(timer);
          // detonation
          setState("detonated");
        }
      }, 0);
    }
  } else if (state == "defused" || state == "detonated") {
    if (timer != null) {
      clearInterval(timer);
    }
    $('#player3').get(0).pause();
    // play "bomb has been defused" sound
    if (state == "defused") {
      $('#player2').get(0).currentTime = 0;
      $('#player2').get(0).play();
    }

    document.getElementById("headline").innerText = "Plant the bomb";
    document.getElementById("seconds-li").style.display = "none";
    document.getElementById("btn-li").style.display = "block";
    document.getElementById("btn").style.display = "block";
    document.getElementById("btn").innerText = "PLANT";
  }
}

$('#btn').on('touchstart', function mouseState(e) {
  $('#defuse-wrapper').show();
  document.getElementById("status").innerText = "You are planting the bomb.";
  $('.def-text').text("Plant time:");
  $('#player4').get(0).currentTime = 0;
  $('#player4').get(0).play();
  
  if (state == "defused" || state == "detonated") {
    // Start of plant
    var plant_done = new Date();
    plant_done.setSeconds(plant_done.getSeconds() + 3.2);
  
    plant_timer = setInterval(function() {
      var now = new Date().getTime();
      var distance = plant_done - now;
      //console.log(distance);
      document.getElementById("countdown").innerText = Math.floor((distance % (minute)) / second);

      if (distance < 0) {
        $('#defuse-wrapper').hide();
        clearInterval(plant_timer);
        setState("planted");
      }
    }, 0);
  } else if (state == "planted") {
    // Start of defuse
    $('#defuse-wrapper').show();
    document.getElementById("status").innerText = "You are defusing the bomb.";
    $('.def-text').text("Defuse time:");
    var defuse_done = new Date();
    defuse_done.setSeconds(defuse_done.getSeconds() + 7);
    
    defuse_timer = setInterval(function() {
      var now = new Date().getTime();
      var distance = defuse_done - now;
      document.getElementById("countdown").innerText = Math.floor((distance % (minute)) / second);

      if (distance < 0) {
        $('#defuse-wrapper').hide();
        clearInterval(defuse_timer);
        setState("defused");
      }
    }, 0);
  }
  
});

$('#btn').on('touchend', function mouseState(e) {
  $('#defuse-wrapper').hide();
  if (state == "defused") {
    clearInterval(plant_timer);
  } else if (state == "planted") {
    clearInterval(defuse_timer);
  }
});

(function () {
  console.log("App initialized");
}());
