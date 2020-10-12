var Conference = Conference || {};
Conference.attendeeContracts = registry => {
    'use strict';

    const attendeePersonalInfo = 'Conference.attendee.personalInfo';
    const attendeeCheckInManagement = 'Conference.attendee.checkInManagement';

    function fulfillsPersonalInfo(att) {
        return typeof att.setId === 'function' &&
            typeof att.getId === 'function' &&
            typeof att.getFullName === 'function';
    }

    function fulfillsCheckInManagement(att) {
        return typeof att.getId === 'function' &&
            typeof att.isCheckedIn === 'function' &&
            typeof att.checkIn === 'function' &&
            typeof att.undoCheckIn === 'function' &&
            typeof att.setCheckInNumber === 'function' &&
            typeof att.getCheckInNumber === 'function';
    }

    registry.define(attendeePersonalInfo, fulfillsPersonalInfo);
    registry.define(attendeeCheckInManagement, fulfillsCheckInManagement);

    registry.attachReturnValidator('attendee', Conference, attendeePersonalInfo);
    registry.attachReturnValidator('attendee', Conference, attendeeCheckInManagement);
};