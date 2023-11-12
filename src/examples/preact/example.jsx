import { render } from 'https://esm.sh/preact';
import React from 'https://esm.sh/preact/compat';
import { useState, useMemo } from 'https://esm.sh/preact/hooks';

// import the 3D project, this will expose dispatcher to your app
import { init, dispatcher } from '/src/main.js';

function Counter() {
  const [value, setValue] = useState(0);

  useMemo(() => {
    init({
      debug: true,
    });
    dispatcher.on('loadProgress', ({ progress }) => {
      console.log(`⏳ Loading ${progress.toFixed(2)}%`);
      setValue(progress.toFixed(2));
    });
  }, []);
  return value < 100 ? (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
      }}>
      <p>⏳ Loading {value}%</p>
    </div>
  ) : null;
}

render(<Counter />, document.body);
