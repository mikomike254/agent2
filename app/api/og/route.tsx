import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const title = searchParams.get('title') || 'CREATIVE.KE Project Node';
        const budget = searchParams.get('budget') || 'Secured';
        const brandColor = searchParams.get('color') || '#5347CE';

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        backgroundColor: '#0a0a0a',
                        backgroundImage: 'radial-gradient(circle at 25px 25px, #1a1a1a 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1a1a1a 2%, transparent 0%)',
                        backgroundSize: '100px 100px',
                        padding: '80px',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
                        <div style={{ width: '40px', height: '40px', backgroundColor: brandColor, borderRadius: '12px', marginRight: '20px' }} />
                        <span style={{ fontSize: '32px', fontWeight: '900', color: 'white', letterSpacing: '-0.05em' }}>
                            CREATIVE.KE <span style={{ color: '#666', marginLeft: '10px' }}>TRANS-NODE</span>
                        </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h1 style={{ fontSize: '80px', fontWeight: '900', color: 'white', lineHeight: '1.1', maxWidth: '900px', marginBottom: '20px', letterSpacing: '-0.02em' }}>
                            {title}
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ fontSize: '24px', fontWeight: '700', color: brandColor, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                                ESCROW SECURED
                            </span>
                            <span style={{ fontSize: '24px', fontWeight: '700', color: '#444', margin: '0 20px' }}>•</span>
                            <span style={{ fontSize: '24px', fontWeight: '700', color: 'white' }}>
                                {budget}
                            </span>
                        </div>
                    </div>

                    <div style={{ position: 'absolute', bottom: '80px', left: '80px', display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: '600px', height: '2px', backgroundColor: '#222' }} />
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch (e: any) {
        return new Response(`Failed to generate OG image`, { status: 500 });
    }
}
