import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = "Ralph Foulger's School of Real Estate";
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background:
            'linear-gradient(135deg, #fbf7f0 0%, #f3ecdc 55%, #ece2cc 100%)',
          color: '#0e1a26',
          fontFamily: 'serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            fontSize: 22,
            letterSpacing: 4,
            color: '#14837b',
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          <div style={{ width: 12, height: 12, borderRadius: 99, background: '#14837b' }} />
          Hawaii · Since 1972
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div
            style={{
              fontSize: 92,
              fontWeight: 900,
              letterSpacing: -3,
              lineHeight: 1,
              color: '#0e1a26',
              fontStyle: 'normal',
            }}
          >
            Pass Hawaii&apos;s real estate
          </div>
          <div
            style={{
              fontSize: 92,
              fontWeight: 900,
              letterSpacing: -3,
              lineHeight: 1,
              color: '#14837b',
              fontStyle: 'italic',
            }}
          >
            exam the first time.
          </div>
          <div
            style={{
              fontSize: 30,
              color: '#3a4a5c',
              marginTop: 18,
              lineHeight: 1.35,
              maxWidth: 980,
            }}
          >
            20-chapter PSI curriculum · Audiobook narration · 24/7 AI tutor · Pass guarantee
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            borderTop: '1px solid rgba(45,55,72,0.18)',
            paddingTop: 26,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <div
              style={{
                fontSize: 30,
                fontWeight: 800,
                letterSpacing: 1,
                color: '#0e1a26',
              }}
            >
              RALPH FOULGER&apos;S SCHOOL OF REAL ESTATE
            </div>
            <div style={{ fontSize: 20, color: '#6b7a8a', letterSpacing: 3, textTransform: 'uppercase' }}>
              Kaneohe · Waikiki · Kauai · 28+ years under Ralph
            </div>
          </div>
          <div
            style={{
              fontSize: 22,
              color: '#e85d3c',
              fontWeight: 700,
              letterSpacing: 4,
              textTransform: 'uppercase',
            }}
          >
            ralphfoulger.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
