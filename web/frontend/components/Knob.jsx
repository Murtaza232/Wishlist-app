import React from 'react';

export function Knob({ selected, onClick, ariaLabel }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={selected}
      aria-label={ariaLabel}
      onClick={onClick}
      style={{
        position: 'relative',
        width: '44px',
        height: '24px',
        backgroundColor: selected ? '#222' : '#666',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        outline: 'none',
        padding: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: selected ? 'flex-end' : 'flex-start',
      }}
    >
      <div
        style={{
          width: '20px',
          height: '20px',
          backgroundColor: 'white',
          borderRadius: '50%',
          margin: '2px',
          transition: 'transform 0.2s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }}
      />
    </button>
  );
} 