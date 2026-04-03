import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Dabboard เฝ้าระวังสถานการณ์ฝุ่น จังหวัดพิษณุโลก',
  description: 'Dabboard เฝ้าระวังสถานการณ์ฝุ่น จังหวัดพิษณุโลก',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
