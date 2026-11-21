import { ImageResponse } from "next/og";

// The icon shown when someone adds the site to their phone's home screen.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#123F46" }}>
        <svg width="132" height="132" viewBox="0 0 48 48">
          <g transform="translate(2 0.5)" fill="none" stroke="#F4F7F2" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="19" cy="10.5" r="5" />
            <path d="M14 18.5C9.8 21 7.5 26 7.5 32.5V42" />
            <path d="M24 18.2c2.2.6 4 1.5 5.4 2.6" />
            <path d="M28.6 26.8c-3.2-.6-7.8.4-10.8 2.8-2 1.6-1.8 3.8.6 4.4 3.6.9 8.8-.6 11.6-3.2" fill="#A8CFC3" stroke="#A8CFC3" />
            <circle cx="32" cy="24.5" r="3.8" fill="#A8CFC3" stroke="#A8CFC3" />
            <path d="M10.5 29.5c2.5 5.8 9 8.8 16.2 7.6 4.6-.8 8.2-3.6 9.8-7.4" />
          </g>
        </svg>
      </div>
    ),
    size
  );
}
