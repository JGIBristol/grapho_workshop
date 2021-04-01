/*!
FullCalendar v5.5.1
Docs & License: https://fullcalendar.io/
(c) 2020 Adam Shaw
*/
var FullCalendarICalendar = (function (exports, common, ICAL) {
    'use strict';

    var eventSourceDef = {
        parseMeta: function (refined) {
            if (refined.url && refined.format === 'ics') {
                return {
                    url: refined.url,
                    format: 'ics',
                };
            }
            return null;
        },
        fetch: function (arg, onSuccess, onFailure) {
            var meta = arg.eventSource.meta;
            var internalState = meta.internalState;
            function handleIcalEvents(errorMessage, iCalEvents, xhr) {
                if (errorMessage) {
                    onFailure({ message: errorMessage, xhr: xhr });
                }
                else {
                    onSuccess({ rawEvents: expandICalEvents(iCalEvents, arg.range), xhr: xhr });
                }
            }
            if (!internalState) {
                internalState = meta.internalState = {
                    completed: false,
                    callbacks: [handleIcalEvents],
                    errorMessage: '',
                    iCalEvents: [],
                    xhr: null,
                };
                requestICal(meta.url, function (rawFeed, xhr) {
                    var iCalEvents = parseICalFeed(rawFeed);
                    for (var _i = 0, _a = internalState.callbacks; _i < _a.length; _i++) {
                        var callback = _a[_i];
                        callback('', iCalEvents, xhr);
                    }
                    internalState.completed = true;
                    internalState.callbacks = [];
                    internalState.iCalEvents = iCalEvents;
                    internalState.xhr = xhr;
                }, function (errorMessage, xhr) {
                    for (var _i = 0, _a = internalState.callbacks; _i < _a.length; _i++) {
                        var callback = _a[_i];
                        callback(errorMessage, [], xhr);
                    }
                    internalState.completed = true;
                    internalState.callbacks = [];
                    internalState.errorMessage = errorMessage;
                    internalState.xhr = xhr;
                });
            }
            else if (!internalState.completed) {
                internalState.callbacks.push(handleIcalEvents);
            }
            else {
                handleIcalEvents(internalState.errorMessage, internalState.iCalEvents, internalState.xhr);
            }
        },
    };
    function requestICal(url, successCallback, failureCallback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 400) {
                successCallback(xhr.responseText, xhr);
            }
            else {
                failureCallback('Request failed', xhr);
            }
        };
        xhr.onerror = function () { return failureCallback('Request failed', xhr); };
        xhr.send(null);
    }
    function parseICalFeed(feedStr) {
        var components = null;
        try {
            var feed = ICAL.parse(feedStr);
            var rootComponent = new ICAL.Component(feed);
            components = rootComponent.getAllSubcomponents('vevent');
        }
        catch (error) {
            console.warn("Error parsing feed: " + error);
            return [];
        }
        var iCalEvents = [];
        for (var _i = 0, components_1 = components; _i < components_1.length; _i++) {
            var component = components_1[_i];
            try {
                var iCalEvent = new ICAL.Event(component);
                if (iCalEvent.startDate) { // is an accessor method. if throws an error, is a bad event
                    iCalEvents.push(iCalEvent);
                }
            }
            catch (error) {
                console.warn("Unable to process item in calendar: " + error);
            }
        }
        return iCalEvents;
    }
    function expandICalEvents(iCalEvents, range) {
        var eventInputs = [];
        var rangeStart = common.addDays(range.start, -1); // account for current TZ needing before UTC date
        var rangeEnd = common.addDays(range.end, 1); // same. TODO: consider duration?
        for (var _i = 0, iCalEvents_1 = iCalEvents; _i < iCalEvents_1.length; _i++) {
            var iCalEvent = iCalEvents_1[_i];
            if (iCalEvent.isRecurring()) {
                var expansion = iCalEvent.iterator(ICAL.Time.fromJSDate(rangeStart));
                var startDateTime = void 0;
                while ((startDateTime = expansion.next())) {
                    var startDate = startDateTime.toJSDate();
                    if (startDate.valueOf() >= rangeEnd.valueOf()) {
                        break;
                    }
                    else {
                        eventInputs.push({
                            title: iCalEvent.summary,
                            start: startDateTime.toString(),
                            end: null,
                        });
                    }
                }
            }
            else {
                eventInputs.push(buildSingleEvent(iCalEvent));
            }
        }
        return eventInputs;
    }
    function buildSingleEvent(iCalEvent) {
        return {
            title: iCalEvent.summary,
            start: iCalEvent.startDate.toString(),
            end: (iCalEvent.endDate ? iCalEvent.endDate.toString() : null),
        };
    }
    var plugin = common.createPlugin({
        eventSourceDefs: [eventSourceDef],
    });

    common.globalPlugins.push(plugin);

    exports.default = plugin;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

}({}, FullCalendar, ICAL));
