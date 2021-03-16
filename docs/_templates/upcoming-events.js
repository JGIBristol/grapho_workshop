import dayGridPlugin from '@fullcalendar/daygrid'
import iCalendarPlugin from '@fullcalendar/icalendar'

var calendar = new Calendar(calendarEl, {
  plugins: [dayGridPlugin, iCalendarPlugin],
  events: {
    url: 'https://mywebsite/icalendar-feed.ics',
    format: 'ics'
  }
})

calendar.render()