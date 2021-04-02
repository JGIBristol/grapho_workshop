import logging
import os
from glob import glob
from ics import Calendar, Event

from docutils.parsers.rst import Directive


# TODO: Create calendar directive? (for displaying calendar) - with download ics file
# TODO: Create upcoming events directive? (for displaying upcoming events)

# class HelloWorld(Directive):
#
#     def run(self):
#         paragraph_node = nodes.paragraph(text='Hello World!')
#
#         return [paragraph_node]


def find_events(app, config):  # analagous to config_inited in ablog
    """
    - Finds events according to the events_pattern provided in config.
    """

    # Automatically identify any blog posts if a pattern is specified in the config
    if isinstance(config.event_pattern, str):
        config.event_pattern = [config.event_pattern]
    matched_patterns = []
    for pattern in config.event_pattern:
        pattern = os.path.join(app.srcdir, pattern)
        matched_patterns.extend(
            os.path.relpath(os.path.splitext(ii)[0], app.srcdir) for ii in glob(pattern, recursive=True)
        )
    app.config.found_events = matched_patterns
    logging.info('found events files:', matched_patterns)

    if len(matched_patterns) > 0:
        app.config.calendar = Calendar()  # Create ICS object


def save_calendar(app):
    calendar_loc = os.path.join(app.srcdir, app.config.calendar_loc)
    logging.info(f"Saving calendar.ics to location :{calendar_loc}")
    with open(calendar_loc, 'w') as f:
        f.write(str(app.config.calendar))


def add_events_docs_to_docnames(app, env, docnames):
    """
    Adds events documents (markdown files in the given directory) to the list of docnames for sphinx to read. This is
    necessary so that we can read the metadata.
    # TODO: Could alternatively add to existing calendar file in case of big backlog of events.
    """
    for docname in app.config.found_events:
        if docname not in docnames:
            docnames.append(docname)


def add_event(app, metadata):
    """
    Adds one event to ics.Calendar object
    """
    event = Event()
    event.name = metadata['title']
    event.categories = [metadata['category']]  # TODO: allow multiple categories
    event.begin = metadata['start-time']
    event.end = metadata['end-time']
    event.location = metadata['location']
    event.url = metadata['reg-url']

    app.config.calendar.events.add(event)


def add_events_to_calendar(app, doctree):
    for docname, metadata in app.env.metadata.items():
        if docname in app.config.found_events:
            add_event(app, metadata)

    save_calendar(app)


def setup(app):
    # TODO: Add directives for displaying calendar and upcoming events.
    # app.add_directive("helloworld", HelloWorld)

    app.add_config_value(  # Where the events files are stored
        name="event_pattern",
        default="_events/*/*",
        rebuild='',
    )
    app.add_config_value(  # Where the events files are stored
        name="calendar_loc",
        default="_static/calendar.ics",
        rebuild='',
    )

    app.connect("config-inited", find_events)
    app.connect("env-before-read-docs", add_events_docs_to_docnames)
    app.connect("env-check-consistency", add_events_to_calendar)
    # app.add_transform(CheckFrontMatter)
    # app.connect("build-finished", save_calendar)  # not the best choice of event if directives use local ical

    # TODO: connect to save calendar

    return {
        'version': '0.1',
        'parallel_read_safe': True,
        'parallel_write_safe': True,
    }
