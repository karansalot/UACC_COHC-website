const buttons = document.querySelectorAll(".filter-button");
const events = document.querySelectorAll(".event-card");

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    buttons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    events.forEach((eventCard) => {
      const types = eventCard.dataset.type.split(" ");
      eventCard.classList.toggle("hidden", filter !== "all" && !types.includes(filter));
    });
  });
});
