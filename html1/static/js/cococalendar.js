// ==========================
// 🌸 ココスク カレンダー機能
// 学生／教師モード対応版
// ==========================

// --------------------------
// 🧭 画面遷移（ナビゲーション）
// --------------------------
function goTimeline(){ window.location.href="cocotimeline.html"; }
function goChat(){ window.location.href="cocochat.html"; }
function goProfile(){ window.location.href="cocoprofile.html"; }
function goSearch(){ window.location.href="cocosearch.html"; }
function goNotifications(){ window.location.href="coconotifications.html"; }

// --------------------------
// 🧩 カレンダー初期設定
// --------------------------
let today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let events = JSON.parse(localStorage.getItem("events") || "[]");

// HTML要素取得
const calendarGrid = document.getElementById("calendarGrid");
const monthLabel = document.getElementById("monthLabel");
const modalBg = document.getElementById("modalBg");
const modalDate = document.getElementById("modalDate");
const eventList = document.getElementById("eventList");
const eventTime = document.getElementById("eventTime");
const eventTitle = document.getElementById("eventTitle");
const eventMemo = document.getElementById("eventMemo");

// --------------------------
// 🧑‍🏫 学生・教師区分確認
// --------------------------
window.addEventListener("DOMContentLoaded", () => {
  let role = localStorage.getItem("userRole");

  if (!role) {
    const answer = prompt("あなたは『学生』ですか『教師』ですか？（学生／教師）");
    if (answer === "教師") {
      const pass = prompt("教師の暗証番号を入力してください");
      if (pass === "BITBITBIT") {
        localStorage.setItem("userRole", "teacher");
        alert("教師モードで利用します。");
      } else {
        alert("暗証番号が違います。学生モードで利用します。");
        localStorage.setItem("userRole", "student");
      }
    } else {
      localStorage.setItem("userRole", "student");
      alert("学生モードで利用します。");
    }
  }

  renderCalendar(currentMonth, currentYear);
});

// --------------------------
// 📅 カレンダー描画
// --------------------------
function renderCalendar(month, year){
  calendarGrid.innerHTML = "";
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  monthLabel.textContent = `${year}年 ${month + 1}月`;

  // 空白埋め
  for (let i = 0; i < firstDay; i++) {
    calendarGrid.appendChild(document.createElement("div"));
  }

  // 日付生成
  for (let d = 1; d <= daysInMonth; d++) {
    const dayDiv = document.createElement("div");
    dayDiv.className = "day";

    const formattedDate = `${year}-${month + 1}-${d}`;
    dayDiv.textContent = d;

    // 今日の日付
    if (d === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
      dayDiv.classList.add("today");
    }

    // イベント表示
    const dayEvents = events.filter(e => e.date === formattedDate);
    if (dayEvents.length > 0) {
      dayDiv.classList.add("has-event");
      dayEvents.slice(0,2).forEach(e=>{
        const preview = document.createElement("div");
        preview.className="event-preview";
        preview.textContent = (e.time ? e.time+" " : "") + e.title;
        dayDiv.appendChild(preview);
      });
      if(dayEvents.length>2){
        const more=document.createElement("div");
        more.className="event-preview";
        more.textContent="…その他";
        dayDiv.appendChild(more);
      }
    }

    dayDiv.addEventListener("click", () => openModal(formattedDate));
    calendarGrid.appendChild(dayDiv);
  }
}

function prevMonth(){
  currentMonth--;
  if(currentMonth < 0){ currentMonth = 11; currentYear--; }
  renderCalendar(currentMonth, currentYear);
}

function nextMonth(){
  currentMonth++;
  if(currentMonth > 11){ currentMonth = 0; currentYear++; }
  renderCalendar(currentMonth, currentYear);
}

// --------------------------
// 🗓 モーダル処理
// --------------------------
function openModal(date){
  modalDate.textContent = date;
  modalBg.style.display = "flex";
  showEvents(date);
}

function closeModal(){
  modalBg.style.display = "none";
  eventTime.value = "";
  eventTitle.value = "";
  eventMemo.value = "";
}

// --------------------------
// ✏️ イベント表示
// --------------------------
function showEvents(date){
  const role = localStorage.getItem("userRole");
  eventList.innerHTML = "";

  let dayEvents = [];

  if (role === "teacher") {
    // 教師：教師の予定のみ表示
    dayEvents = events.filter(e => e.date === date && e.role === "teacher");
  } else {
    // 学生：自分の予定＋教師の予定を表示
    dayEvents = events.filter(e => e.date === date && (e.role === "teacher" || e.role === "student"));
  }

  if (dayEvents.length === 0) {
    eventList.innerHTML = "<div>予定なし</div>";
  } else {
    dayEvents.forEach((e, index) => {
      const div = document.createElement("div");
      div.className = "event-card";
      div.innerHTML = `
        <div class="event-time">${e.time || "時間指定なし"}</div>
        <div class="event-title">${e.title}</div>
        ${e.memo ? `<div class="event-memo">${e.memo}</div>` : ""}
      `;

      // 編集・削除ボタン制御
      if ((role === "teacher" && e.role === "teacher") ||
          (role === "student" && e.role === "student")) {
        const del = document.createElement("button");
        del.className = "delete-btn";
        del.textContent = "×";
        del.onclick = () => deleteEvent(date, index);
        div.appendChild(del);
      }

      eventList.appendChild(div);
    });
  }
}

// --------------------------
// ➕ イベント追加
// --------------------------
function addEvent(){
  const date = modalDate.textContent;
  const time = eventTime.value;
  const title = eventTitle.value.trim();
  const memo = eventMemo.value.trim();
  const role = localStorage.getItem("userRole");

  if (!title) return alert("予定を入力してください！");

  if (role === "teacher") {
    events.push({ date, time, title, memo, role: "teacher" });
  } else {
    events.push({ date, time, title, memo, role: "student" });
  }

  localStorage.setItem("events", JSON.stringify(events));
  showEvents(date);
  renderCalendar(currentMonth, currentYear);

  eventTime.value = "";
  eventTitle.value = "";
  eventMemo.value = "";
}

// --------------------------
// ❌ イベント削除
// --------------------------
function deleteEvent(date, index){
  const role = localStorage.getItem("userRole");

  const dayEvents = events.filter(e => e.date === date);
  const targetEvent = dayEvents[index];

  // 権限チェック
  if (role !== targetEvent.role) {
    return alert("この予定は削除できません。");
  }

  // 該当データを削除
  let newEvents = [];
  let skipped = false;
  for (let e of events) {
    if (!skipped && e.date === date && e.title === targetEvent.title && e.time === targetEvent.time && e.memo === targetEvent.memo && e.role === targetEvent.role) {
      skipped = true; // 1件だけ削除
      continue;
    }
    newEvents.push(e);
  }

  events = newEvents;
  localStorage.setItem("events", JSON.stringify(events));
  showEvents(date);
  renderCalendar(currentMonth, currentYear);
}
