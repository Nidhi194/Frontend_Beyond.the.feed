window.BeyondFeedCalculator = (function () {
  const fields = [
    ['instagram', 'Instagram'],
    ['youtube', 'YouTube'],
    ['whatsapp', 'WhatsApp'],
    ['other', 'Other'],
  ];

  const activities = [
    {
      icon: 'Film',
      name: 'Movie marathon',
      hours: 2,
      copy: (count) =>
        `Watch ~${count} movies instead of collecting movie clips in 30-second parts.`,
    },
    {
      icon: 'Read',
      name: 'Short books',
      hours: 5,
      copy: (count) =>
        `Read ~${count} short books, with fewer “I’ll start tonight” promises.`,
    },
    {
      icon: 'Make',
      name: 'Mandala or art sessions',
      hours: 1,
      copy: (count) =>
        `Create ~${count} one-hour art sessions instead of adding ideas to your someday saves.`,
    },
    {
      icon: 'Ride',
      name: 'Long rides',
      hours: 2,
      copy: (count) =>
        `Take ~${count} long rides and explore somewhere beyond the next recommended Reel.`,
    },
    {
      icon: 'Learn',
      name: 'Mini projects',
      hours: 10,
      copy: (count) =>
        `Start ~${count} mini projects, even if one becomes a very committed side quest.`,
    },
    {
      icon: 'Go',
      name: 'Weekend trips',
      hours: 24,
      copy: (count) =>
        `Plan ~${count} weekend trips instead of watching someone else’s vacation vlog.`,
    },
    {
      icon: 'People',
      name: 'Friends and family time',
      hours: 2,
      copy: (count) =>
        `Make room for ~${count} long catch-ups with people who do not need a like button.`,
    },
  ];

  function markup() {
    const inputs = fields
      .map(([id, label]) => inputRow(id, label))
      .join('');

    return `
      <section class="habit-calculator" aria-labelledby="calculator-title">
        <div class="calculator-intro">
          <p class="eyebrow">Measure · Reflect · Reimagine</p>

          <h2 id="calculator-title">
            Your digital time,<br>
            <em>counted differently.</em>
          </h2>

          <p>
            Enter an approximate day. No judgement, no productivity sermon.
            Just a friendly look at where the minutes could wander next.
          </p>
        </div>

        <form id="habit-calculator-form" class="calculator-form">
          ${inputs}

          <p class="calculator-hint">
            Use hours and minutes. Empty fields count as zero.
          </p>

          <button class="button-dark" type="submit">
            Calculate My Scroll Time
          </button>

          <button
            class="calculator-reset"
            id="calculator-reset"
            type="button"
          >
            Reset Calculator
          </button>

          <p
            class="calculator-error"
            id="calculator-error"
            role="alert"
            aria-live="polite"
          ></p>
        </form>
      </section>

      <section
        id="calculator-results"
        class="calculator-results"
        aria-live="polite"
        hidden
      ></section>
    `;
  }

  function inputRow(id, label) {
    return `
      <div class="calculator-input-row">
        <label for="${id}-hours">${label}</label>

        <div>
          <input
            id="${id}-hours"
            type="number"
            min="0"
            step="0.5"
            inputmode="decimal"
            placeholder="0"
            aria-label="${label} hours"
          >

          <span>hours</span>

          <input
            id="${id}-minutes"
            type="number"
            min="0"
            max="59"
            step="1"
            inputmode="numeric"
            placeholder="0"
            aria-label="${label} minutes"
          >

          <span>minutes</span>
        </div>
      </div>
    `;
  }

  function init() {
    const form = document.querySelector('#habit-calculator-form');
    const resetButton = document.querySelector('#calculator-reset');

    if (!form || !resetButton) return;

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      calculateUsage();
    });

    resetButton.addEventListener('click', resetCalculator);
  }

  function calculateUsage() {
    const dailyMinutes = fields.reduce(
      (total, [id]) => total + readMinutes(id),
      0
    );

    const error = document.querySelector('#calculator-error');
    const results = document.querySelector('#calculator-results');

    if (dailyMinutes <= 0) {
      error.textContent = 'Enter some screen time first.';
      results.hidden = true;
      return;
    }

    error.textContent = '';

    renderResults(
      dailyMinutes,
      dailyMinutes * 7,
      dailyMinutes * 30
    );
  }

  function readMinutes(field) {
    const hours = safeNumber(
      document.querySelector(`#${field}-hours`).value
    );

    const minutes = Math.min(
      59,
      safeNumber(document.querySelector(`#${field}-minutes`).value)
    );

    return hours * 60 + minutes;
  }

  function safeNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : 0;
  }

  function renderResults(dailyMinutes, weeklyMinutes, monthlyMinutes) {
    const days = monthlyMinutes / (24 * 60);
    const comparisons = calculateActivityComparisons(monthlyMinutes);
    const result = document.querySelector('#calculator-results');

    result.innerHTML = `
      <div class="calculator-summary">
        <p class="eyebrow">Your digital time</p>

        <div class="time-stat-grid">
          <div>
            <strong>${formatTime(dailyMinutes)}</strong>
            <span>per day</span>
          </div>

          <div>
            <strong>${formatTime(weeklyMinutes)}</strong>
            <span>per week</span>
          </div>

          <div>
            <strong>~${formatTime(monthlyMinutes)}</strong>
            <span>per month</span>
          </div>

          <div>
            <strong>≈ ${days.toFixed(1)} days</strong>
            <span>every month</span>
          </div>
        </div>
      </div>

      <div class="reimagined-section">
        <p class="eyebrow">Your scroll time, reimagined</p>

        <h2>
          With ~${formatTime(monthlyMinutes)},<br>
          <em>you could...</em>
        </h2>

        <p class="reimagined-lead">
          That is about ${days.toFixed(1)} full days.
          Your minutes are yours to remix, rearrange, or spend exactly as you like.
        </p>

        <div class="comparison-grid">
          ${comparisons.map(comparisonCard).join('')}
        </div>

        <p class="humor-line">
          ${friendlyLine(monthlyMinutes)}
        </p>
      </div>
    `;

    result.hidden = false;
    result.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  function calculateActivityComparisons(monthlyMinutes) {
    const availableHours = monthlyMinutes / 60;

    return activities
      .filter((activity) => availableHours >= activity.hours)
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5)
      .map((activity) => ({
        ...activity,
        count: Math.max(
          1,
          Math.floor(availableHours / activity.hours)
        ),
      }));
  }

  function comparisonCard(activity) {
    return `
      <article class="comparison-card">
        <span class="comparison-icon">${activity.icon}</span>

        <h3>${activity.name}</h3>

        <strong>~${activity.count}</strong>

        <p>${activity.copy(activity.count)}</p>
      </article>
    `;
  }

  function friendlyLine(monthlyMinutes) {
    if (monthlyMinutes < 60) {
      return 'That is enough time to make something small instead of adding it to your “I’ll try this someday” saves.';
    }

    if (monthlyMinutes < 120) {
      return 'That is enough time to finish a movie instead of watching its best scenes in tiny pieces.';
    }

    if (monthlyMinutes < 1440) {
      return 'That is enough time to explore a new place instead of watching someone else’s vacation vlog.';
    }

    return 'That is enough time to save thousands of reels you will definitely watch again someday. Probably.';
  }

  function formatTime(minutes) {
    const total = Math.max(0, Math.round(minutes));
    const hours = Math.floor(total / 60);
    const minutesLeft = total % 60;

    if (!hours) return `${minutesLeft}m`;
    if (!minutesLeft) return `${hours}h`;

    return `${hours}h ${minutesLeft}m`;
  }

  function resetCalculator() {
    document.querySelector('#habit-calculator-form').reset();
    document.querySelector('#calculator-error').textContent = '';
    document.querySelector('#calculator-results').hidden = true;
  }

  return {
    markup,
    init,
  };
})();