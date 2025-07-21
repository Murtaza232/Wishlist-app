import React from "react";

const drawerStyle = {
  position: "fixed",
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  zIndex: 1000,
  background: "#fff",
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
  boxShadow: "0 -2px 16px rgba(0,0,0,0.15)",
  transition: "transform 0.3s cubic-bezier(.4,0,.2,1)",
  transform: "translateY(100%)",
  maxHeight: "100vh",
  height: "100vh",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column"
};

export default function SlideUpDrawer({ open, onClose, children }) {
  return (
    <>
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.2)",
            zIndex: 999,
          }}
          onClick={onClose}
        />
      )}
      <div
        style={{
          ...drawerStyle,
          transform: open ? "translateY(0)" : "translateY(100%)",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        {/* Custom Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '18px 32px 10px 24px',
          borderBottom: '1px solid #ececec',
          background: '#fff',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="../assets/wishlist.avif" alt="App Icon" style={{ width: 28, height: 28, borderRadius: 6, marginRight: 8 }} />
            <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: '-0.5px' }}>Customize Wishlist Plus</span>
          </div>
          <button
            onClick={onClose}
            style={{
              position: 'relative',
              top: '-6px',
              background: 'none',
              border: 'none',
              fontSize: 26,
              cursor: 'pointer',
              color: '#222',
              padding: 0,
              marginLeft: 16
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div style={{ padding: 0, flex: 1, minHeight: 0 }}>
          {children}
        </div>
      </div>
    </>
  );
} 