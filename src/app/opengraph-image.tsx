import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = "Shajpori — Modern Women's Fashion"
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #FF66A3 0%, #D81B60 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'serif',
        }}
      >
        {/* White card */}
        <div style={{
          background: 'white',
          borderRadius: '32px',
          padding: '60px 80px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 40px 80px rgba(0,0,0,0.2)',
          minWidth: '700px',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', fontSize: '80px', fontWeight: 900, letterSpacing: '-2px', color: '#111' }}>
            <span>Shaj</span>
            <span style={{ color: '#FF66A3' }}>pori</span>
          </div>
          {/* Tagline */}
          <div style={{
            fontSize: '26px',
            color: '#666',
            marginTop: '16px',
            fontFamily: 'sans-serif',
            fontWeight: 400,
            letterSpacing: '1px',
          }}>
            Bangladesh&apos;s Favourite Fashion Destination
          </div>
          {/* Tags */}
          <div style={{
            display: 'flex',
            gap: '16px',
            marginTop: '32px',
          }}>
            {['Western Dresses', 'Designer Bags', 'Accessories'].map(tag => (
              <div key={tag} style={{
                background: '#FFF0F4',
                color: '#D81B60',
                borderRadius: '50px',
                padding: '10px 24px',
                fontSize: '18px',
                fontFamily: 'sans-serif',
                fontWeight: 600,
              }}>
                {tag}
              </div>
            ))}
          </div>
        </div>
        {/* URL badge */}
        <div style={{
          color: 'rgba(255,255,255,0.85)',
          fontSize: '22px',
          marginTop: '32px',
          fontFamily: 'sans-serif',
          letterSpacing: '2px',
        }}>
          shajpori.com
        </div>
      </div>
    ),
    { ...size }
  )
}
