import React from 'react';

interface TimetableProps {
    timetableData: string[][];
}

const Timetable: React.FC<TimetableProps> = ({ timetableData }) => {
    return (
        <table>
            <thead>
                <tr>
                    <th>Day</th>
                    <th>Time</th>
                    <th>Event</th>
                </tr>
            </thead>
            <tbody>
                {timetableData.map((row, index) => (
                    <tr key={index}>
                        <td>{row[0]}</td>
                        <td>{row[1]}</td>
                        <td>{row[2]}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default Timetable;