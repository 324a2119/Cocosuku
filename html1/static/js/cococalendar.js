// ナビゲーション用
function goTimeline(){ window.location.href="cocotimeline.html"; }
function goChat(){ window.location.href="cocochat.html"; }
function goProfile(){ window.location.href="cocoprofile.html"; }
function goSearch(){ window.location.href="cocosearch.html"; }
function goNotifications(){ window.location.href="coconotifications.html"; }

let today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let events = JSON.parse(localStorage.getItem("events") || "[]");

const calendarGrid = document.getElementById("calendarGrid");
const monthLabel = document.getElementById("monthLabel");
const modalBg = document.getElementById("modalBg");
const modalDate = document.getElementById("modalDate");
const eventList = document.getElementById("eventList");
const eventTime = document.getElementById("eventTime");
const eventTitle = document.getElementById("eventTitle");
const eventMemo = document.getElementById("eventMemo");

function renderCalendar(month, year){
  calendarGrid.innerHTML = "";
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  monthLabel.textContent = `${year}年 ${month + 1}月`;

  for(let i=0;i<firstDay;i++){ calendarGrid.appendChild(document.createElement("div")); }

  for(let d=1; d<=daysInMonth; d++){
    const dayDiv = document.createElement("div");
    dayDiv.className="day";
    const formattedMonth = String(month + 1);
    const formattedDay = String(d);
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;
    dayDiv.textContent = d;
    if(d===today.getDate() && month===today.getMonth() && year===today.getFullYear()) dayDiv.classList.add("today");

    const dayEvents = events.filter(e=>e.date===dateStr);
    if(dayEvents.length>0){
      dayDiv.classList.add("has-event");
      dayEvents.slice(0,2).forEach(e=>{
        const preview = document.createElement("div");
        preview.className="event-preview";
        preview.textContent = (e.time?e.time+" ":"") + e.title;
        dayDiv.appendChild(preview);
      });
      if(dayEvents.length>2){
        const more = document.createElement("div");
        more.className="event-preview";
        more.textContent = "…その他";
        dayDiv.appendChild(more);
      }
    }

    dayDiv.addEventListener("click", ()=> openModal(dateStr));
    calendarGrid.appendChild(dayDiv);
  }
}
renderCalendar(currentMonth,currentYear);

function prevMonth(){ currentMonth--; if(currentMonth<0){currentMonth=11; currentYear--;} renderCalendar(currentMonth,currentYear);}
function nextMonth(){ currentMonth++; if(currentMonth>11){currentMonth=0; currentYear++;} renderCalendar(currentMonth,currentYear);}

function openModal(date){
  modalDate.textContent = date;
  modalBg.style.display="flex";
  showEvents(date);
}
function closeModal(){
  modalBg.style.display="none";
  eventTime.value=""; eventTitle.value=""; eventMemo.value="";
}

function showEvents(date){
  eventList.innerHTML="";
  const dayEvents = events.filter(e=>e.date===date);
  if(dayEvents.length===0){
    eventList.innerHTML="<div>予定なし</div>";
  } else {
    dayEvents.forEach((e,index)=>{
      const div = document.createElement("div");
      div.className="event-card";
      div.innerHTML = `<div class="event-time">${e.time || "時間指定なし"}</div>
                       <div class="event-title">${e.title}</div>
                       ${e.memo?`<div class="event-memo">${e.memo}</div>`:""}
                       <button class="delete-btn" onclick="deleteEvent('${date}',${index})">×</button>`;
      eventList.appendChild(div);
    });
  }
}

function addEvent(){
  const date = modalDate.textContent;
  const time = eventTime.value;
  const title = eventTitle.value.trim();
  const memo = eventMemo.value.trim();
  if(!title) return alert("予定を入力してください！");
  
  const dateParts = date.split('-');
  const formattedDate = `${dateParts[0]}-${parseInt(dateParts[1])}-${parseInt(dateParts[2])}`;
  
  events.push({date: formattedDate, time, title, memo});
  localStorage.setItem("events",JSON.stringify(events));
  showEvents(date);
  renderCalendar(currentMonth,currentYear);
  eventTime.value=""; eventTitle.value=""; eventMemo.value="";
}

function deleteEvent(date,index){
  events = events.filter((e,i)=>!(e.date===date && i===index));
  localStorage.setItem("events",JSON.stringify(events));
  showEvents(date);
  renderCalendar(currentMonth,currentYear);
}
