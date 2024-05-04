import React from 'react';
import './Timetable.css'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'

interface TimetableProps {
    timetableData: string[][];
}

const events = [
    { title: 'Meeting', start: new Date() }
  ]

function renderEventContent(eventInfo: { timeText: any; event: any; }) {
    return (
      <>
        <b>{eventInfo.timeText}</b>
        <i>{eventInfo.event.title}</i>
      </>
    )
  }

const Timetable: React.FC<TimetableProps> = ({ timetableData }) => {
    return (
        <div className='timetable'>
            <FullCalendar
                plugins={[timeGridPlugin]}
                initialView='timeGridWeek'
                weekends={false}
                events={events}
                eventContent={renderEventContent}
            />
        </div>
    );
};

export default Timetable;