const socket = io();

const $nickname = document.getElementById("nickname");
const $formForNickname = $nickname.querySelector("form");
const $myNickname = document.querySelector("#myNickname");
const $rooms = document.getElementById("rooms");
const $formForRoom = $rooms.querySelector("form");
const $roomList = document.getElementById("roomList");
const $inRoom = document.getElementById("inRoom");
const $formForChat = $inRoom.querySelector("form");
const $ul = $inRoom.querySelector("ul");

$inRoom.hidden = true;
let nowRoom;
let myNickname = '익명';

function showRoom(){
  $rooms.hidden = true;
  $nickname.hidden = true;
  $roomList.hidden = true;
  $inRoom.hidden = false;
}

function enterRoom(event){
  event.preventDefault();
  const $input = $formForRoom.querySelector("input");
  const $roomName = $inRoom.querySelector("#roomName");
  nowRoom = $input.value;
  $roomName.textContent = `${nowRoom} 방`
  socket.emit("enterRoom", $input.value, showRoom);
  $input.value = "";
}

function addMessage(msg, nickname){
  const $li = document.createElement("li");
  $li.textContent = `${nickname}: ${msg}`;
  $ul.append($li);
}

function sendMessage(event){
  event.preventDefault();
  const $input = $formForChat.querySelector("input");
  addMessage($input.value, myNickname);
  socket.emit("sendMessage", $input.value, nowRoom);
  $input.value = "";
}

function showNickname(event){
  event.preventDefault();
  const $input = $formForNickname.querySelector("input");
  myNickname = $input.value;
  $myNickname.textContent = `현재 닉네임: ${myNickname}`;
  $nickname.hidden = true;
  socket.emit("getNickname",myNickname);
}

$formForNickname.addEventListener("submit", showNickname);
$formForRoom.addEventListener("submit", enterRoom);
$formForChat.addEventListener("submit", sendMessage);

socket.on("someoneEnter", (nickname, userNum) => {
  addMessage('방에 입장했습니다', nickname = "익명");
  addMessage(`현재: ${userNum}명`, 'system');
})

socket.on("sendMessage", (msg, nickname) => {
  addMessage(msg, nickname);
})

socket.on("bye", (nickname, userNum) => {
  addMessage('방에서 나갔습니다', nickname);
  addMessage(`현재: ${userNum}명`, 'system');
})

socket.on("roomChange", (publicRooms) => {
  const $ul = $roomList.querySelector("ul");
  $ul.innerText = "";
  publicRooms.forEach((e) => {
    const $li = document.createElement("li");
    $li.textContent = e;
    $ul.append($li);
  })
});

socket.on("gameStart", () => {
  addMessage(`모든 인원이 참석했습니다. 게임을 시작합니다`, 'system');
})