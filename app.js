const stocks = [
  {
    symbol: "DEMO01",
    name: "示例能源A",
    industry: "能源",
    close: 13.5,
    pct: -2.88,
    volumeRatio: 0.92,
    score: 42,
    action: "风险处理",
    risk: "高",
    thesis: "前期资金推动后回撤明显，演示侧重点是仓位减压、风险线和反弹观察。",
  },
  {
    symbol: "DEMO02",
    name: "示例材料B",
    industry: "新材料",
    close: 49.04,
    pct: 1.21,
    volumeRatio: 1.08,
    score: 58,
    action: "观察",
    risk: "中",
    thesis: "周期品种样本，适合展示行业弹性、趋势修复和财务对比。",
  },
  {
    symbol: "DEMO03",
    name: "示例材料C",
    industry: "新材料",
    close: 44.44,
    pct: 0.86,
    volumeRatio: 1.01,
    score: 55,
    action: "观察",
    risk: "中",
    thesis: "同属材料链条，可作为行业横向参照。",
  },
  {
    symbol: "DEMO04",
    name: "示例化工D",
    industry: "化工",
    close: 34.2,
    pct: -0.73,
    volumeRatio: 0.84,
    score: 49,
    action: "等待",
    risk: "中",
    thesis: "化工与制造交叉样本，用于展示量能不足时的观望状态。",
  },
  {
    symbol: "DEMO05",
    name: "示例制造E",
    industry: "制造",
    close: 37.29,
    pct: 2.14,
    volumeRatio: 1.36,
    score: 67,
    action: "候选",
    risk: "中",
    thesis: "放量修复型样本，用于展示候选信号如何进入扫描列表。",
  },
  {
    symbol: "DEMO06",
    name: "示例周期F",
    industry: "周期",
    close: 9.36,
    pct: 0.32,
    volumeRatio: 0.77,
    score: 52,
    action: "观察",
    risk: "低",
    thesis: "低价大盘周期样本，用于展示稳态持仓和较低波动风险。",
  },
  {
    symbol: "DEMO07",
    name: "示例化工G",
    industry: "化工",
    close: 38.44,
    pct: -1.48,
    volumeRatio: 1.18,
    score: 46,
    action: "减压",
    risk: "中",
    thesis: "冲高回落样本，用于展示反 T 和压力位管理。",
  },
  {
    symbol: "DEMO08",
    name: "示例有色H",
    industry: "有色",
    close: 31.25,
    pct: 3.08,
    volumeRatio: 1.42,
    score: 72,
    action: "候选",
    risk: "中",
    thesis: "强势周期样本，用于展示高分候选但仍需控制追高风险。",
  },
];

const periods = ["daily", "1", "5", "15", "30", "60"];
const labels = { daily: "日K", 1: "1分", 5: "5分", 15: "15分", 30: "30分", 60: "60分" };
const positions = {
  DEMO01: { shares: 300, cost: 13.8 },
  DEMO02: { shares: 100, cost: 48.2 },
};

let selected = "DEMO01";
let period = "daily";
let toastTimer = 0;

const $ = (id) => document.getElementById(id);
const formatPrice = (value, digits = 2) => (Number.isFinite(value) ? Number(value).toFixed(digits) : "--");
const formatPct = (value) => (Number.isFinite(value) ? `${Number(value).toFixed(2)}%` : "--");
const toneClass = (value) => (value > 0 ? "up" : value < 0 ? "down" : "flat");

function formatMoney(value) {
  if (!Number.isFinite(value)) return "--";
  if (Math.abs(value) >= 100000000) return `${(value / 100000000).toFixed(2)}亿`;
  if (Math.abs(value) >= 10000) return `${(value / 10000).toFixed(2)}万`;
  return value.toFixed(0);
}

function seeded(seed) {
  let value = seed % 2147483647;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function symbolSeed(symbol) {
  return symbol.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function generateBars(stock, selectedPeriod) {
  const count = selectedPeriod === "daily" ? 96 : 78;
  const seed = symbolSeed(stock.symbol);
  const rand = seeded(seed);
  const bars = [];
  const drift = stock.symbol === "DEMO01" ? -0.0019 : stock.score > 60 ? 0.0012 : 0.0002;
  const volatility = stock.risk === "高" ? 0.035 : stock.risk === "中" ? 0.022 : 0.014;
  let close = stock.close * (selectedPeriod === "daily" ? 0.78 : 0.985);

  for (let index = 0; index < count; index += 1) {
    const wave = Math.sin(index / 7 + seed % 23) * volatility * 0.55;
    const shock = (rand() - 0.5) * volatility;
    const open = close * (1 + (rand() - 0.5) * volatility * 0.55);
    close = Math.max(0.8, close * (1 + drift + wave + shock));
    const high = Math.max(open, close) * (1 + rand() * volatility * 0.9);
    const low = Math.min(open, close) * (1 - rand() * volatility * 0.9);
    const date =
      selectedPeriod === "daily"
        ? `07-${String(Math.max(1, 29 - count + index)).padStart(2, "0")}`
        : `${String(9 + Math.floor(index / 12)).padStart(2, "0")}:${String((index % 12) * 5).padStart(2, "0")}`;

    bars.push({
      date,
      open: round(open),
      high: round(high),
      low: round(low),
      close: round(close),
      volume: Math.round((0.7 + rand() * 1.8) * stock.volumeRatio * 1000000),
    });
  }

  const factor = stock.close / bars[bars.length - 1].close;
  return bars.map((bar, index) => ({
    ...bar,
    open: round(bar.open * factor),
    high: round(bar.high * factor),
    low: round(bar.low * factor),
    close: index === bars.length - 1 ? stock.close : round(bar.close * factor),
  }));
}

function movingAverage(values, windowSize) {
  return values.map((_, index) => {
    if (index + 1 < windowSize) return null;
    const segment = values.slice(index + 1 - windowSize, index + 1);
    return segment.reduce((a, b) => a + b, 0) / segment.length;
  });
}

function riskScore(stock, pnlPct, dayPct) {
  let score = stock.risk === "高" ? 58 : stock.risk === "中" ? 38 : 18;
  if (dayPct < -3) score += 16;
  if (pnlPct < -8) score += 20;
  if (stock.action.includes("风险") || stock.action.includes("减压")) score += 12;
  return Math.max(0, Math.min(100, score));
}

function riskTone(value) {
  if (value === "高") return "risk-high";
  if (value === "中") return "risk-mid";
  return "risk-low";
}

function riskCopy(stock, pnlPct, hardLine) {
  if (stock.symbol === "DEMO01") {
    return `示例能源A为高风险样本：若跌破 ${formatPrice(hardLine)} 后不能收回，优先展示减压而不是继续低吸。`;
  }
  if (pnlPct < -8) return "持仓浮亏较深，T点应服务于降低风险敞口。";
  if (stock.score >= 65) return "评分较高但仍需等待回踩确认，避免把候选信号当成追高指令。";
  return "当前以观察为主，等待价格、量能和均线重新同向。";
}

function showToast(message) {
  const node = $("toast");
  node.textContent = message;
  node.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    node.hidden = true;
  }, 2600);
}

function renderWatchList() {
  $("watchList").innerHTML = stocks
    .map(
      (stock) => `
        <button class="watch-item ${stock.symbol === selected ? "active" : ""}" data-symbol="${stock.symbol}">
          <span>
            <strong>${stock.symbol} ${stock.name}</strong>
            <small>${stock.industry}</small>
          </span>
          <span class="price-side">
            <strong class="${toneClass(stock.pct)}">${formatPrice(stock.close)}</strong>
            <small class="${toneClass(stock.pct)}">${formatPct(stock.pct)}</small>
          </span>
        </button>
      `,
    )
    .join("");
}

function renderPeriods() {
  $("periodButtons").innerHTML = periods
    .map(
      (item) => `
        <button type="button" class="${period === item ? "active" : ""}" data-period="${item}">
          ${labels[item]}
        </button>
      `,
    )
    .join("");
}

function renderScan() {
  const query = $("filter").value.trim();
  const filtered = stocks.filter((stock) => `${stock.symbol}${stock.name}${stock.industry}`.includes(query));
  $("scanTable").innerHTML = filtered
    .map(
      (stock) => `
        <button type="button" data-symbol="${stock.symbol}">
          <span>${stock.symbol}</span>
          <span>${stock.name}</span>
          <span class="${toneClass(stock.pct)}">${formatPct(stock.pct)}</span>
          <span>${stock.score}</span>
          <span>${stock.action}</span>
        </button>
      `,
    )
    .join("");
}

function renderSignals() {
  $("signalList").innerHTML = stocks
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(
      (stock) => `
        <button type="button" data-symbol="${stock.symbol}">
          <strong>${stock.symbol} ${stock.name} · ${stock.score}</strong>
          <span>${stock.thesis}</span>
        </button>
      `,
    )
    .join("");
}

function setTone(node, tone) {
  node.className = tone;
}

function renderQuote() {
  const stock = stocks.find((item) => item.symbol === selected) || stocks[0];
  const bars = generateBars(stock, period);
  const latest = bars[bars.length - 1];
  const previous = bars[bars.length - 2] || latest;
  const dayPct = latest && previous ? (latest.close / previous.close - 1) * 100 : stock.pct;
  const position = positions[selected] || { shares: 0, cost: 0 };
  const pnl = position.cost ? (stock.close - position.cost) * position.shares : 0;
  const pnlPct = position.cost ? (stock.close / position.cost - 1) * 100 : 0;
  const low20 = Math.min(...bars.slice(-20).map((bar) => bar.low));
  const high20 = Math.max(...bars.slice(-20).map((bar) => bar.high));
  const positiveZone = [round(stock.close * 0.94), round(Math.max(low20, stock.close * 0.985))];
  const reverseZone = [round(stock.close * 1.035), round(Math.max(high20, stock.close * 1.08))];
  const hardLine = round(Math.min(low20, stock.close * 0.93));
  const riskLevel = riskScore(stock, pnlPct, dayPct);
  const riskText = riskLevel >= 72 ? "高" : riskLevel >= 42 ? "中" : "低";

  $("quoteTitle").textContent = `${stock.symbol} ${stock.name}`;
  $("quoteIndustry").textContent = stock.industry;
  $("quotePrice").textContent = formatPrice(stock.close);
  $("quotePct").textContent = formatPct(dayPct);
  setTone($("quotePrice"), toneClass(dayPct));
  setTone($("quotePct"), toneClass(dayPct));
  $("quoteAction").textContent = stock.action;
  $("quoteScore").textContent = String(stock.score);
  $("quoteVolumeRatio").textContent = formatPrice(stock.volumeRatio);
  $("quoteRisk").textContent = riskText;
  setTone($("quoteRisk"), riskTone(riskText));
  $("ohlc").textContent = `开 ${formatPrice(latest.open)} 高 ${formatPrice(latest.high)} 低 ${formatPrice(latest.low)} 收 ${formatPrice(latest.close)}`;

  $("shares").value = position.shares;
  $("cost").value = position.cost;
  $("marketValue").textContent = formatMoney(stock.close * position.shares);
  $("pnl").textContent = `${formatMoney(pnl)} · ${formatPct(pnlPct)}`;
  setTone($("pnl"), toneClass(pnl));
  $("costLatest").textContent = `${formatPrice(position.cost, 3)} / ${formatPrice(stock.close)}`;
  $("riskMeta").textContent = riskText;
  $("range20").textContent = `${formatPrice(low20)} - ${formatPrice(high20)}`;
  $("hardLine").textContent = formatPrice(hardLine);
  $("positionPressure").textContent = position.shares ? formatPct(pnlPct) : "未持仓";
  setTone($("positionPressure"), position.shares ? toneClass(pnlPct) : "flat");
  $("riskCopy").textContent = riskCopy(stock, pnlPct, hardLine);
  $("positiveZone").textContent = `${formatPrice(positiveZone[0])} - ${formatPrice(positiveZone[1])}`;
  $("reverseZone").textContent = `${formatPrice(reverseZone[0])} - ${formatPrice(reverseZone[1])}`;
  $("discipline").textContent = stock.risk === "高" ? "反弹先减压" : "等待确认";

  drawChart($("chart"), bars, period);
}

function drawAverage(ctx, bars, windowSize, y, left, step, color) {
  const averages = movingAverage(
    bars.map((bar) => bar.close),
    windowSize,
  );
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  let started = false;
  averages.forEach((avg, index) => {
    if (avg === null) return;
    const x = left + index * step + step / 2;
    const py = y(avg);
    if (!started) {
      ctx.moveTo(x, py);
      started = true;
    } else {
      ctx.lineTo(x, py);
    }
  });
  ctx.stroke();
}

function drawChart(canvas, bars, selectedPeriod) {
  if (!canvas || !bars.length) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(680, Math.floor(rect.width * ratio));
  const height = Math.max(330, Math.floor(rect.height * ratio));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#101211";
  ctx.fillRect(0, 0, width, height);

  const pad = { top: 18, right: 62, bottom: 40, left: 52 };
  const volumeHeight = 70;
  const priceHeight = height - pad.top - pad.bottom - volumeHeight - 12;
  const chartWidth = width - pad.left - pad.right;
  const highs = bars.map((bar) => bar.high);
  const lows = bars.map((bar) => bar.low);
  const maxPrice = Math.max(...highs);
  const minPrice = Math.min(...lows);
  const y = (price) => pad.top + ((maxPrice - price) / (maxPrice - minPrice || 1)) * priceHeight;
  const step = chartWidth / bars.length;
  const candleWidth = Math.max(2, Math.min(9, step * 0.58));

  ctx.strokeStyle = "#2a302d";
  ctx.fillStyle = "#84908a";
  ctx.font = `${12 * ratio}px system-ui`;
  for (let i = 0; i <= 4; i += 1) {
    const gy = pad.top + (priceHeight * i) / 4;
    ctx.beginPath();
    ctx.moveTo(pad.left, gy);
    ctx.lineTo(width - pad.right, gy);
    ctx.stroke();
    ctx.fillText((maxPrice - ((maxPrice - minPrice) * i) / 4).toFixed(2), 8, gy + 4);
  }

  if (selectedPeriod === "daily") {
    drawAverage(ctx, bars, 5, y, pad.left, step, "#d9a441");
    drawAverage(ctx, bars, 20, y, pad.left, step, "#55b8c6");
  }

  bars.forEach((bar, index) => {
    const x = pad.left + index * step + step / 2;
    const rising = bar.close >= bar.open;
    ctx.strokeStyle = rising ? "#e35c52" : "#2ab06f";
    ctx.fillStyle = rising ? "#e35c52" : "#2ab06f";
    ctx.beginPath();
    ctx.moveTo(x, y(bar.high));
    ctx.lineTo(x, y(bar.low));
    ctx.stroke();
    const bodyTop = Math.min(y(bar.open), y(bar.close));
    const bodyHeight = Math.max(1, Math.abs(y(bar.open) - y(bar.close)));
    ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
  });

  const volumeTop = pad.top + priceHeight + 12;
  const maxVolume = Math.max(...bars.map((bar) => bar.volume));
  bars.forEach((bar, index) => {
    const x = pad.left + index * step + step / 2;
    const rising = bar.close >= bar.open;
    const barHeight = Math.max(1, (bar.volume / maxVolume) * volumeHeight);
    ctx.fillStyle = rising ? "rgba(227,92,82,0.48)" : "rgba(42,176,111,0.48)";
    ctx.fillRect(x - Math.max(1, step * 0.3), volumeTop + volumeHeight - barHeight, Math.max(1, step * 0.6), barHeight);
  });

  ctx.fillStyle = "#84908a";
  ctx.fillText(bars[0].date, pad.left, height - 13);
  ctx.fillText(bars[bars.length - 1].date, width - pad.right - 58, height - 13);
}

function selectStock(symbol) {
  selected = symbol;
  render();
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    const stockButton = event.target.closest("[data-symbol]");
    if (stockButton) {
      selectStock(stockButton.dataset.symbol);
      return;
    }
    const periodButton = event.target.closest("[data-period]");
    if (periodButton) {
      period = periodButton.dataset.period;
      renderPeriods();
      renderQuote();
      return;
    }
    const toastButton = event.target.closest("[data-toast]");
    if (toastButton) {
      showToast(toastButton.dataset.toast);
    }
  });

  $("filter").addEventListener("input", renderScan);
  $("savePosition").addEventListener("click", () => {
    positions[selected] = {
      shares: Number($("shares").value) || 0,
      cost: Number($("cost").value) || 0,
    };
    renderQuote();
    showToast("演示持仓已保存到当前页面");
  });
  window.addEventListener("resize", () => renderQuote());
}

function render() {
  $("stockCount").textContent = String(stocks.length);
  $("watchMeta").textContent = `${stocks.length} 只`;
  renderWatchList();
  renderPeriods();
  renderScan();
  renderSignals();
  renderQuote();
}

bindEvents();
render();
