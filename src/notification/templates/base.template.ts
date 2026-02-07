export interface BaseTemplateParams {
  userName: string;
  preferencesUrl: string;
}

export function getBaseEmailHtml(
  content: string,
  preferencesUrl: string,
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #F06542; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .content { background: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; }
          .cta-button {
            display: inline-block;
            background: #F06542;
            color: white !important;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            margin: 20px 0;
            font-weight: bold;
          }
          .cta-button:hover {
            background: #d9553a;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 12px;
          }
          .footer a { color: #F06542; text-decoration: none; }
          .deadline {
            background: #fff3cd;
            border: 1px solid #ffc107;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
          }
          .info-box {
            background: #e7f3ff;
            border: 1px solid #0066cc;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Survivor Fantasy League</h1>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <p>
              <a href="${preferencesUrl}">Manage notification preferences</a>
            </p>
            <p>Survivor Fantasy League</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
