from docutils import nodes
import logging
import os
from glob import glob
from ics import Calendar, Event

from docutils.parsers.rst import Directive

from sphinx.transforms import SphinxTransform

# TODO: Create calendar object in a "connect"?
# TODO: Add ICS files from event posts in a transform
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
    print('matched patterns:', matched_patterns)


def process_events(app, doctree):  # analagous to process_posts in ablog
    """"
    - make sure that datetimes can be read by docutils
    """
    # env = app.builder.env
    # TODO: Write


class CheckFrontMatter(SphinxTransform):
    """
    Gets the YAML info and uses it to build/update calendar.ics
    """
    # TODO: figure out why only runs if delete _build
    default_priority = 800

    def apply(self):

        # only run apply for events
        if self.env.docname not in self.config.found_events:
            return None

        # TODO: add asserts/logging for non-empty metadata
        docinfo = list(self.document.traverse(nodes.docinfo))
        if not docinfo:
            return None
        docinfo = docinfo[0]

        metadata = {fn.children[0].astext(): fn.children[1].astext() for fn in docinfo.traverse(nodes.field)}
        print('metadata', metadata)


def setup(app):
    # TODO: Delete:
    # app.add_directive("helloworld", HelloWorld)

    app.add_config_value(  # Where the events files are stored
        name="event_pattern",
        default="_events/*/*",
        rebuild='',  # TODO: check: not sure if true
    )
    app.connect("config-inited", find_events)
    app.connect("doctree-read", process_events)
    app.add_transform(CheckFrontMatter)

    return {
        'version': '0.1',
        'parallel_read_safe': True,
        'parallel_write_safe': True,
    }
