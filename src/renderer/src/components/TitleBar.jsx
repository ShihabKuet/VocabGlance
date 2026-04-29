/**
 * TitleBar — Custom draggable title bar for the frameless dashboard window.
 */

import { useTheme } from '../context/ThemeContext'

export default function TitleBar() {
  const { colors } = useTheme()

  return (
    <div style={{
      height: 36,
      background: colors.bg,
      borderBottom: `1px solid ${colors.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 12px',
      flexShrink: 0,
      WebkitAppRegion: 'drag',
      transition: 'background 0.25s ease, border-color 0.25s ease',
    }}>
      <div style={{ display: 'flex', gap: 6, WebkitAppRegion: 'no-drag' }}>
        <WinBtn color="#FFB93E" hoverColor="#FFA500" onClick={() => window.api.minimizeWindow()} title="Minimize" />
        <WinBtn color="#3FD265" hoverColor="#28A745" onClick={() => window.api.maximizeWindow()} title="Maximize" />
        <WinBtn color="#FF6058" hoverColor="#E0443C" onClick={() => window.api.closeWindow()}    title="Close"    />
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
