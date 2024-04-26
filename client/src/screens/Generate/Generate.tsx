import React from 'react';

interface Props {
    name: string;
}

const Generate: React.FC<Props> = ({ name }) => {
    return <div>Generate, {name}!</div>;
};

export default Generate;