import { ImageResponse } from 'next/og'

export const alt = '27 Creative Studio — Instagram Reels & Growth Agency in Thoothukudi'
export const size = { width: 1200, height: 600 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0B0B0B',
          padding: '56px',
          border: '12px solid #141419',
        }}
      >
        {/* Top Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#D4FF3F',
                color: '#0B0B0B',
                fontWeight: 900,
                fontSize: '30px',
                padding: '4px 16px',
                borderRadius: '8px',
              }}
            >
              27
            </div>
            <div
              style={{
                display: 'flex',
                color: '#EFE6D8',
                fontSize: '22px',
                fontWeight: 800,
                letterSpacing: '2px',
              }}
            >
              CREATIVE STUDIO
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              color: '#FF2DA8',
              fontSize: '16px',
              fontWeight: 700,
              letterSpacing: '3px',
            }}
          >
            REC 4K DCI · 24FPS
          </div>
        </div>

        {/* Center Typography */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div
            style={{
              display: 'flex',
              color: '#FF2DA8',
              fontSize: '20px',
              fontWeight: 700,
              letterSpacing: '4px',
            }}
          >
            THOOTHUKUDI · TAMIL NADU
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontSize: '70px',
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            <div style={{ display: 'flex', color: '#EFE6D8' }}>REAL GROWTH.</div>
            <div style={{ display: 'flex', color: '#D4FF3F' }}>REAL RESULTS.</div>
          </div>
        </div>

        {/* Bottom Proof Strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '2px solid rgba(239, 230, 216, 0.15)',
            paddingTop: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '36px',
              color: '#EFE6D8',
              fontSize: '18px',
            }}
          >
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{ color: '#D4FF3F', fontWeight: 900 }}>4</span>
              <span>Clients</span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{ color: '#FF2DA8', fontWeight: 900 }}>6,300+</span>
              <span>Followers</span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{ color: '#D4FF3F', fontWeight: 900 }}>6.1x</span>
              <span>Peak Growth</span>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              backgroundColor: '#D4FF3F',
              color: '#0B0B0B',
              fontSize: '16px',
              fontWeight: 800,
              padding: '8px 20px',
              borderRadius: '9999px',
            }}
          >
            wa.me/918300478244
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
