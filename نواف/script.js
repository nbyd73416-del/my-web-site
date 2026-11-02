// Get an initial time from the public World Time API, then update locally each second.
const timeElement = document.getElementById('currentTime');
const statusElement = document.getElementById('clockStatus');
const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Riyadh';
const apiUrl = `https://worldtime.timezone.io/api/timezone/${encodeURIComponent(localTimeZone).replace(/%2F/gi, '/')}`;

let syncedTime = Date.now();
let syncStartedAt = Date.now();
let activeTimeZone = localTimeZone;

function renderClock() {
  const now = new Date(syncedTime + (Date.now() - syncStartedAt));
  timeElement.textContent = new Intl.DateTimeFormat('ar-SA', {
    timeZone: activeTimeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  }).format(now);
  timeElement.dateTime = now.toISOString();
}

async function syncClock() {
  try {
    const response = await fetch(apiUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error(`API response: ${response.status}`);

    const timeData = await response.json();
    const apiTime = Date.parse(timeData.datetime);
    if (!Number.isFinite(apiTime) || !timeData.timezone) {
      throw new Error('The API returned invalid time data');
    }

    syncedTime = apiTime;
    syncStartedAt = Date.now();
    activeTimeZone = timeData.timezone;
    statusElement.textContent = `متصل بواجهة الوقت API · ${activeTimeZone}`;
  } catch (error) {
    // Keep the clock usable when the API or internet connection is unavailable.
    syncedTime = Date.now();
    syncStartedAt = Date.now();
    statusElement.textContent = 'تعذر الاتصال بالـ API؛ يعرض الوقت المحلي';
  }

  renderClock();
}

renderClock();
window.setInterval(renderClock, 1000);
syncClock();
window.setInterval(syncClock, 5 * 60 * 1000);
