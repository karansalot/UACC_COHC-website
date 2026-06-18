document.addEventListener("DOMContentLoaded", () => {
  // 1. Weekly Class Schedule Day Filtering
  const filterButtons = document.querySelectorAll(".filter-btn");
  const scheduleCards = document.querySelectorAll(".schedule-card");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      // Update active button styling
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      // Filter cards
      scheduleCards.forEach((card) => {
        if (filter === "all") {
          card.style.display = "flex";
        } else {
          const cardDay = card.dataset.day;
          if (cardDay === filter) {
            card.style.display = "flex";
          } else {
            card.style.display = "none";
          }
        }
      });
    });
  });

  // 2. Campus Details Switcher (North vs. Orange Grove)
  const campusTabs = document.querySelectorAll(".campus-tab-btn");
  const campusPanels = document.querySelectorAll(".campus-panel");

  campusTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetCampus = tab.dataset.campus;

      // Switch active tab indicator
      campusTabs.forEach((btn) => btn.classList.remove("active"));
      tab.classList.add("active");

      // Switch active panels
      campusPanels.forEach((panel) => {
        const panelId = panel.id;
        if (panelId === `campus-${targetCampus}`) {
          panel.classList.add("active");
        } else {
          panel.classList.remove("active");
        }
      });
    });
  });

  // 3. Intake Form Submission and Local Simulation
  const intakeForm = document.getElementById("intakeForm");
  const successOverlay = document.getElementById("successOverlay");
  const closeSuccessBtn = document.getElementById("closeSuccessBtn");

  if (intakeForm) {
    intakeForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // Gather input values
      const fullName = document.getElementById("fullName").value;
      const email = document.getElementById("emailAddr").value;
      const phone = document.getElementById("phoneNumber").value;
      const role = document.getElementById("userRole").value;
      const campus = document.getElementById("campusPref").value;
      const msg = document.getElementById("message").value;

      // Gather checked program interests
      const interests = [];
      document.querySelectorAll("input[name='interest']:checked").forEach((chk) => {
        interests.push(chk.value);
      });

      // Construct lead object
      const leadData = {
        fullName,
        email,
        phone,
        role,
        interests,
        campus,
        message: msg,
        submittedAt: new Date().toISOString()
      };

      // Save to localStorage so stakeholders can see submissions in the browser dev tools
      const currentSubmissions = JSON.parse(localStorage.getItem("uacc_intake_submissions") || "[]");
      currentSubmissions.push(leadData);
      localStorage.setItem("uacc_intake_submissions", JSON.stringify(currentSubmissions));

      // Trigger animation and reveal success card
      successOverlay.classList.add("active");
    });
  }

  if (closeSuccessBtn && intakeForm) {
    closeSuccessBtn.addEventListener("click", () => {
      // Clear and close
      intakeForm.reset();
      successOverlay.classList.remove("active");
    });
  }

  // 4. iCalendar (.ics) File Generator for "Add to Calendar" button
  const calButtons = document.querySelectorAll(".add-cal-btn");

  calButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const title = btn.dataset.title;
      const desc = btn.dataset.desc;
      const startTimeStr = btn.dataset.start; // "0930"
      const endTimeStr = btn.dataset.end;   // "1030"
      const targetDay = btn.dataset.day;     // "tuesday"

      // Calculate the next date matching the weekday
      const nextDate = getNextWeekday(targetDay);
      
      // Parse year, month, date
      const yyyy = nextDate.getFullYear();
      const mm = String(nextDate.getMonth() + 1).padStart(2, "0");
      const dd = String(nextDate.getDate()).padStart(2, "0");

      // Format as YYYYMMDD
      const datePart = `${yyyy}${mm}${dd}`;

      // Assemble local times (no timezone suffix to default to user's system timezone)
      const fullStart = `${datePart}T${startTimeStr}00`;
      const fullEnd = `${datePart}T${endTimeStr}00`;

      // Generate ICS format content with weekly recurrence rule
      const icsData = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//UACC Holistic Circles//Weekly Calendar//EN",
        "BEGIN:VEVENT",
        `UID:uacc-holistic-class-${datePart}-${startTimeStr}@arizona.edu`,
        `DTSTAMP:${yyyy}${mm}${dd}T000000Z`,
        `DTSTART;TZID=America/Phoenix:${fullStart}`,
        `DTEND;TZID=America/Phoenix:${fullEnd}`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${desc}`,
        "LOCATION:University of Arizona Cancer Center",
        "RRULE:FREQ=WEEKLY",
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\r\n");

      // Create blob download link
      const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, "_")}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  });

  // Helper function to find upcoming weekday
  function getNextWeekday(dayName) {
    const dayMap = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6
    };
    const targetDayNum = dayMap[dayName.toLowerCase()];
    const today = new Date();
    const currentDayNum = today.getDay();
    
    let daysToAdd = targetDayNum - currentDayNum;
    if (daysToAdd < 0) {
      daysToAdd += 7; // Next week's weekday
    } else if (daysToAdd === 0) {
      // If it is today but past the start hour, schedule for next week
      // For simplicity, we just schedule for today or next week based on weekday match
    }

    const resultDate = new Date();
    resultDate.setDate(today.getDate() + daysToAdd);
    return resultDate;
  }
});
