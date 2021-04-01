document.addEventListener("DOMContentLoaded", function () {
        var calendarEl = document.getElementById("calendar");
        var today = new Date().toISOString().split("T")[0];

        var calendar = new FullCalendar.Calendar(calendarEl, {
          theme: 'bootstrap',
          displayEventTime: false,
          initialDate: today,
          headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,listYear",
          },
          events: {
            url: "https://raw.githubusercontent.com/Jean-Golding-Institute/grapho_workshop/gh-pages/_static/calendar.ics",
            format: "ics",
            failure: function () {
              document.getElementById("script-warning").style.display = "block";
            },
          },
          loading: function (bool) {
            document.getElementById("loading").style.display = bool
              ? "block"
              : "none";
          },
        });

        calendar.render();
});