'use client'

import React, { useState } from 'react';

export default function Page() {

    const [color, setColor] = useState('white');

    const changeColor = (newColor: string) => {
        setColor(newColor);
    };

    return (
        <div>
            <style jsx>{`
                div {
                    background-color: ${color};
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
            `}</style>
            
            <h1>Color: {color}</h1>
            <button onClick={() => changeColor('red')}>Red</button>
            <button onClick={() => changeColor('green')}>Green</button>
            <button onClick={() => changeColor('blue')}>Blue</button>
        </div>
    );



}