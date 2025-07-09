'use client';

import React, { useState } from 'react';

export default function Home() {
  const [input, setInput] = useState('');

  const onClick = () => {
    console.log(input);
  };
  

  return (
    <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh"}}>
      <input
      placeholder="Enter your name"
      style={{background : "grey"}}
      value={input}
      onChange={(e) => setInput(e.target.value)}>
      </input>
      <button onClick={onClick}>Submit</button>




    </div>
  );
}