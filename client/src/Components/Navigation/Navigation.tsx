import React from 'react';
import { Link } from 'react-router-dom';

const Navigation = () => {
    return (
        <nav>
            <ul>
                <li>
                    <Link to="/">Dashboard</Link>
                </li>
                <li>
                    <Link to="/timetable">Timetable</Link>
                </li>
                <li>
                    <Link to="/signin">Sign in</Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navigation;