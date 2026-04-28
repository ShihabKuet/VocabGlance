/**
 * TitleBar — Custom draggable title bar for the frameless dashboard window.
 * Provides minimize / maximize / close controls that call main via IPC.
 */

import { colors } from '../styles/tokens'

const { bg, border, textMuted } = colors

export default function TitleBar() {
  return (
    <div style={{
      height: 36,
      background: bg,
      borderBottom: `1px solid ${border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 12px',
      flexShrink: 0,
      // Makes the entire bar draggable (Electron specific)
      WebkitAppRegion: 'drag',
    }}>
      {/* Window controls – must be no-drag so clicks register */}
      <div style={{ display: 'flex', gap: 6, WebkitAppRegion: 'no-drag' }}>
        <WinBtn color="#FFB93E" hoverColor="#FFA500" onClick={() => window.api.minimizeWindow()} title="Minimize" />
        <WinBtn color="#3FD265" hoverColor="#28A745" onClick={() => window.api.maximizeWindow()} title="Maximize" />
        <WinBtn color="#FF6058" hoverColor="#E0443C" onClick={() => window.api.closeWindow()}    title="Close" />
      </div>
    </div>
  )
}

function WinBtn({ color, hoverColor, onClick, title }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: 12, height: 12, borderRadius: '50%',
        background: color, border: 'none', cursor: 'pointer',
        transition: 'background 0.15s, transform 0.12s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = hoverColor; e.currentTarget.style.transform = 'scale(1.15)' }}
      onMouseLeave={e => { e.currentTarget.style.background = color;      e.currentTarget.style.transform = 'scale(1)' }}
    />
  )
}
