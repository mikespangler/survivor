export interface BaseTemplateParams {
  userName: string;
  preferencesUrl: string;
}

const LOGO_URL = 'https://res.cloudinary.com/dm2gfa9t8/image/upload/e_trim,h_80,c_fit,f_png,q_auto/main-logo';

export function getBaseEmailHtml(
  content: string,
  preferencesUrl: string,
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: #14181F;
            color: #F8F6F2;
          }
          .wrapper {
            background: #14181F;
            padding: 40px 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
          }
          .header {
            background: linear-gradient(138deg, #212630 0%, #191D24 100%);
            padding: 40px 32px;
            text-align: center;
            border-radius: 16px 16px 0 0;
            border: 1px solid rgba(48, 53, 65, 0.5);
            border-bottom: none;
          }
          .header img {
            height: 64px;
            width: auto;
          }
          .app-name {
            color: #F8F6F2;
            font-size: 28px;
            font-weight: 700;
            margin: 16px 0 8px 0;
            letter-spacing: 2px;
          }
          .subheader {
            color: #818898;
            font-size: 12px;
            letter-spacing: 2px;
            text-transform: uppercase;
          }
          .content {
            background: linear-gradient(138deg, #212630 0%, #191D24 100%);
            padding: 32px;
            border-radius: 0 0 16px 16px;
            border: 1px solid rgba(48, 53, 65, 0.5);
            border-top: none;
          }
          .content h2 {
            color: #F8F6F2;
            margin: 0 0 16px 0;
            font-size: 22px;
            font-weight: 600;
          }
          .content p {
            color: #818898;
            margin: 0 0 16px 0;
            font-size: 15px;
            line-height: 1.6;
          }
          .content strong {
            color: #F8F6F2;
          }
          .cta-button {
            display: inline-block;
            background: #F06542;
            color: #14181F !important;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 12px;
            margin: 24px 0;
            font-weight: 600;
            font-size: 15px;
            box-shadow: 0 4px 0 #C34322;
          }
          .deadline {
            background: rgba(249, 195, 31, 0.1);
            border: 1px solid rgba(249, 195, 31, 0.3);
            padding: 16px;
            border-radius: 12px;
            margin: 20px 0;
          }
          .deadline p {
            color: #F9C31F;
            margin: 0;
          }
          .info-box {
            background: rgba(107, 126, 203, 0.1);
            border: 1px solid rgba(107, 126, 203, 0.3);
            padding: 16px;
            border-radius: 12px;
            margin: 20px 0;
          }
          .info-box p {
            color: #6B7ECB;
            margin: 0;
          }
          .footer {
            text-align: center;
            padding: 24px;
            color: #818898;
            font-size: 13px;
          }
          .footer a {
            color: #F06542;
            text-decoration: none;
          }
          .footer a:hover {
            text-decoration: underline;
          }
          .divider {
            height: 1px;
            background: rgba(48, 53, 65, 0.5);
            margin: 24px 0;
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <img src="${LOGO_URL}" alt="Outpick Outlast" />
              <div class="app-name">OUTPICK OUTLAST</div>
              <div class="subheader">A Survivor Fantasy League</div>
            </div>
            <div class="content">
              ${content}
            </div>
            <div class="footer">
              <p>
                <a href="${preferencesUrl}">Manage notification preferences</a>
              </p>
              <p style="margin-top: 12px;">Outpick Outlast</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}
