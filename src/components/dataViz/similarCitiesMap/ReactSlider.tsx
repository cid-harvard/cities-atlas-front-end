import React from 'react';
import { Slider, Handles } from 'react-compound-slider';

const sliderStyle: React.CSSProperties = {  // Give the slider some width
  position: 'relative',
  width: '100%',
  marginTop: '0.5rem',
};

const railStyle: React.CSSProperties = {
  width: '100%',
  height: 10,
  borderRadius: 5,
  backgroundColor: '#8B9CB6',
};

function Handle({
  handle: { id, value, percent },
  getHandleProps,
}: any) {
  return (
    <div
      style={{
        left: `${percent}%`,
        position: 'absolute',
        marginLeft: -15,
        marginTop: 25,
        zIndex: 2,
        width: 30,
        height: 30,
        border: 0,
        textAlign: 'center',
        cursor: 'pointer',
        borderRadius: '50%',
        backgroundColor: '#2C4870',
        color: '#333',
      }}
      {...getHandleProps(id)}
    >
      <div style={{ fontFamily: 'Roboto', fontSize: 11, marginTop: -35 }}>
        {value}
      </div>
    </div>
  );
}

const ReactSlider = () => {
  return (
    <Slider
      rootStyle={sliderStyle /* inline styles for the outer div. Can also use className prop. */}
      domain={[0, 100]}
      values={[10]}
     >
        <div style={railStyle /* Add a rail as a child.  Later we'll make it interactive. */} />
    <Handles>
      {({ handles, getHandleProps }) => (
        <div className='slider-handles'>
          {handles.map(handle => (
            <Handle
              key={handle.id}
              handle={handle}
              getHandleProps={getHandleProps}
            />
          ))}
        </div>
      )}
    </Handles>
    </Slider>
  );
};

export default ReactSlider;
