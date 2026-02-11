(function () {
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);
  
    // Year
    const yearEl = $("#year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  
    // Reveal pills
    $$(".pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-reveal");
        const panel = document.getElementById(id);
        if (!panel) return;
        const isHidden = panel.hasAttribute("hidden");
        // hide all
        $$(".reveal").forEach((p) => p.setAttribute("hidden", ""));
        // show selected
        if (isHidden) panel.removeAttribute("hidden");
      });
    });
  
    // Back to top
    const backToTop = $("#backToTop");
    if (backToTop) {
      backToTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  
    // Theme toggle (persist)
    const themeToggle = $("#themeToggle");
    const KEY = "net_tutorial_theme";
    const applyTheme = (t) => {
      if (t === "light") document.documentElement.setAttribute("data-theme", "light");
      else document.documentElement.removeAttribute("data-theme");
    };
  
    const saved = localStorage.getItem(KEY);
    if (saved) applyTheme(saved);
  
    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        const isLight = document.documentElement.getAttribute("data-theme") === "light";
        const next = isLight ? "dark" : "light";
        applyTheme(next === "light" ? "light" : "dark");
        localStorage.setItem(KEY, next);
      });
    }

    let activeLockUntil = 0;
    // Sidebar active (IntersectionObserver)
    const navLinks = Array.from(document.querySelectorAll(".nav-link"));
    const sections = navLinks
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);

    function setActiveById(id) {
      navLinks.forEach((l) => {
        const active = l.getAttribute("href") === `#${id}`;
        l.classList.toggle("is-active", active);
        if (active) moveIndicatorTo(l); // 給 Part 2 用
      });
    }
    const indicator = document.querySelector(".nav-indicator");

function moveIndicatorTo(link) {
  if (!indicator || !link) return;

  const navRect = link.parentElement.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();

  indicator.style.transform =
    `translateY(${linkRect.top - navRect.top}px)`;
  indicator.style.height = `${linkRect.height}px`;
}

    // 預設亮第一個
    if (sections.length) setActiveById(sections[0].id);
    
    // 基準線：視窗上方 30% 處，落在哪個 section 內就亮哪一項（高區塊如 #wifi、#router-upgrade 也能正確亮）
    const activationLineRatio = 0.3;

    const updateActiveSection = () => {
      if (Date.now() < activeLockUntil) return;
      const activationLine = window.innerHeight * activationLineRatio;
      let bestId = null;

      for (const sec of sections) {
        const rect = sec.getBoundingClientRect();
        if (rect.top <= activationLine && rect.bottom >= activationLine) {
          bestId = sec.id;
          break;
        }
      }

      if (bestId) {
        setActiveById(bestId);
        return;
      }

      // 沒有 section 包住基準線時（例如在頁頂或區塊之間）：選中心最接近基準線的
      let bestDist = Infinity;
      for (const sec of sections) {
        const rect = sec.getBoundingClientRect();
        const center = (rect.top + rect.bottom) / 2;
        const dist = Math.abs(activationLine - center);
        if (dist < bestDist) {
          bestDist = dist;
          bestId = sec.id;
        }
      }
      if (bestId) setActiveById(bestId);
    };

    const io = new IntersectionObserver(
        (entries) => {
          updateActiveSection();
        },
        { root: null, rootMargin: "0px", threshold: [0, 0.01, 0.1, 0.5, 1] }
      );
      
      sections.forEach((sec) => io.observe(sec));

    let scrollTicking = false;
    window.addEventListener("scroll", () => {
      if (scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(() => {
        updateActiveSection();
        scrollTicking = false;
      });
    }, { passive: true });

  // Center section on sidebar click
navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    const id = link.getAttribute("href")?.replace("#", "");
    const sec = document.getElementById(id);
    if (!sec) return;

    e.preventDefault();

    // 🔒 使用者優先 300ms
    activeLockUntil = Date.now() + 300;
    setActiveById(id);

    sec.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  });
});


    // WiFi cards interactive compare
  const metricButtons = Array.from(document.querySelectorAll(".wifi-metric"));
  const wifiSummaryText = document.querySelector("#wifiSummary .wifi-summary-text");

  const wifiData = {
    throughput: {
      summary: "⚡ 吞吐：6 是『效率升級』；6E 是 6GHz 帶來的頻段擴充；7 衝極限吞吐；8 走向把高吞吐『穩定兌現』。",
      scores: { "6": 62, "6e": 72, "7": 90, "8": 86 },
      points: {
        "6": ["OFDMA / MU-MIMO 提升多裝置效率", "家用升級體感明顯", "仍受限 2.4/5GHz 擁擠環境"],
        "6e": ["6GHz 可用頻段更乾淨", "對高品質串流更友善", "升級成本相對平衡"],
        "7": ["更高吞吐取向", "多設備高負載更吃香", "新世代旗艦規格中心"],
        "8": ["吞吐目標更偏向『穩』", "密集場景體感效率", "企業級導向更明顯"]
      }
    },
  
    latency: {
      summary: "⏱️ 延遲：6 讓排程更有效率；6E 在干擾少時也很舒服；7 更偏向低延遲體驗；8 強調低延遲的一致性。",
      scores: { "6": 66, "6e": 68, "7": 88, "8": 90 },
      points: {
        "6": ["排程效率更好，延遲較 WiFi 5 改善", "一般遊戲/會議體感更順", "擁擠頻段時仍可能有抖動"],
        "6e": ["6GHz 減少擁擠干擾", "一般遊戲/會議體感提升", "環境好時很穩"],
        "7": ["低延遲方向很明確", "多頻協同帶來體感改善", "適合雲端遊戲/VR"],
        "8": ["更重視『一致』低延遲", "複雜環境抖動控制", "企業級即時應用更友善"]
      }
    },
  
    reliability: {
      summary: "🛡️ 穩定：6 成熟普及、相容性好；6E 因 6GHz 干擾少而穩；7 性能強但看環境；8 的方向是『在更難的場景也穩』。",
      scores: { "6": 78, "6e": 80, "7": 76, "8": 92 },
      points: {
        "6": ["規格成熟、設備選擇多", "相容性佳，部署門檻低", "高密度/複雜環境較吃力"],
        "6e": ["干擾少，連線體感穩", "適合家庭/辦公室升級", "部署策略相對簡單"],
        "7": ["性能強但環境差異大", "需要更好的規劃與設備", "適合重度玩家/新機型"],
        "8": ["可靠性優先級更高", "面向高密度與複雜場景", "更像『穩定性版本迭代』"]
      }
    },
  
    interference: {
      summary: "🧠 干擾：6 多在 2.4/5GHz 仍會擁擠；6E 靠 6GHz 乾淨頻段；7 用更靈活多頻策略；8 目標是讓多頻協作更可靠。",
      scores: { "6": 70, "6e": 84, "7": 82, "8": 90 },
      points: {
        "6": ["主要在 2.4/5GHz，較容易受鄰居干擾", "透過頻道規劃可改善", "缺少 6GHz 的天然乾淨優勢"],
        "6e": ["6GHz 干擾少", "與舊設備干擾分離", "高密度環境更好用"],
        "7": ["多頻運用更靈活", "需要良好頻段規劃", "在混雜環境仍強"],
        "8": ["更偏向『協作更可靠』", "密集場景效率提升", "目標是更一致的體感"]
      }
    }
  };
  
  const dom = {
    score6: document.getElementById("score6"),
    score6e: document.getElementById("score6e"),
    score7: document.getElementById("score7"),
    score8: document.getElementById("score8"),
    bar6: document.getElementById("bar6"),
    bar6e: document.getElementById("bar6e"),
    bar7: document.getElementById("bar7"),
    bar8: document.getElementById("bar8"),
    points6: document.getElementById("points6"),
    points6e: document.getElementById("points6e"),
    points7: document.getElementById("points7"),
    points8: document.getElementById("points8")
  };

  function setList(el, items) {
    if (!el) return;
    el.innerHTML = "";
    items.forEach((t) => {
      const li = document.createElement("li");
      li.textContent = t;
      el.appendChild(li);
    });
  }

  function setWifiMetric(metric) {
    const data = wifiData[metric];
    if (!data) return;

    // button active
    metricButtons.forEach((b) => b.classList.toggle("is-active", b.dataset.metric === metric));

    // update scores + bars
    const s6 = data.scores["6"], s6e = data.scores["6e"], s7 = data.scores["7"], s8 = data.scores["8"];
    if (dom.score6) dom.score6.textContent = String(s6);
    if (dom.score6e) dom.score6e.textContent = String(s6e);
    if (dom.score7) dom.score7.textContent = String(s7);
    if (dom.score8) dom.score8.textContent = String(s8);

    if (dom.bar6) dom.bar6.style.width = `${s6}%`;
    if (dom.bar6e) dom.bar6e.style.width = `${s6e}%`;
    if (dom.bar7) dom.bar7.style.width = `${s7}%`;
    if (dom.bar8) dom.bar8.style.width = `${s8}%`;

    // update bullets
    setList(dom.points6, data.points["6"]);
    setList(dom.points6e, data.points["6e"]);
    setList(dom.points7, data.points["7"]);
    setList(dom.points8, data.points["8"]);

    // summary
    if (wifiSummaryText) wifiSummaryText.textContent = data.summary;
  }

  if (metricButtons.length) {
    metricButtons.forEach((btn) => btn.addEventListener("click", () => setWifiMetric(btn.dataset.metric)));
    setWifiMetric("throughput");
  }
  
// ===== CTA jump → center card + highlight =====
const HIGHLIGHT_CLASS = "is-jump-highlight";
const HIGHLIGHT_MS = 1500;

function highlightCard(card) {
  if (!card) return;

  card.classList.remove(HIGHLIGHT_CLASS);
  void card.offsetWidth; // restart animation
  card.classList.add(HIGHLIGHT_CLASS);

  window.setTimeout(() => card.classList.remove(HIGHLIGHT_CLASS), HIGHLIGHT_MS);
}

function jumpToCardCenter(id) {
  const card = document.getElementById(id);
  if (!card) return;

  card.scrollIntoView({ behavior: "smooth", block: "center" });

  // 等 scroll 開始後再亮，避免動畫在畫面外跑完
  window.setTimeout(() => highlightCard(card), 320);
}

// 只綁 CTA 區塊的連結（避免側欄也被攔截）
document.querySelectorAll(".cta-actions a[href^='#wifi']").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    const id = link.getAttribute("href").slice(1);
    jumpToCardCenter(id);

    // 更新 hash，但不觸發瀏覽器預設跳轉
    history.pushState(null, "", `#${id}`);
  });
});

// 從網址直接進入 #wifi6 也置中＋發光一次
window.setTimeout(() => {
  const id = window.location.hash.replace("#", "");
  if (["wifi6", "wifi6e", "wifi7", "wifi8"].includes(id)) jumpToCardCenter(id);
}, 0);
  })();
  