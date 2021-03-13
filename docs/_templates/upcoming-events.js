  document.addEventListener('DOMContentLoaded', function() {
   var calendarEl = document.getElementById('calendar');

   var events = [
      {% for post in site.events %}
      {% include event.js %}{% if forloop.last %}{% else %},{% endif %}
      {% endfor %}
   ];

   events = events.filter(e => new Date(e.start) >= new Date());
   events.sort((e1, e2) => new Date(e1.start) - new Date(e2.start));

   calendar = new FullCalendar.Calendar(calendarEl, {
     headerToolbar: false,
     noEventsContent: "No upcoming events",
     timeZone: 'UTC',
     initialView: 'listYear',
     editable: true,
     selectable: true,
     events: events
   });
  calendar.render();
});