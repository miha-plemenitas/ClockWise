import React, { useState } from 'react';

interface CustomizeProps {
    initialText: string;
}

const Customize: React.FC<CustomizeProps> = ({ initialText }) => {
    const [text, setText] = useState(initialText);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setText(event.target.value);
    };

    return (
        <div>
            <input type="text" value={text} onChange={handleChange} />
            <p>{text}</p>
        </div>
    );
};

export default Customize;