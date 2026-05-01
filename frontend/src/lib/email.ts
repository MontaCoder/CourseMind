import { appLogo, companyName } from '@/constants';

type EmailTemplateOptions = {
  title: string;
  body: string;
  buttonHref?: string;
  buttonText?: string;
  preview?: string;
};

export function emailTemplate({ title, body, buttonHref, buttonText, preview = title }: EmailTemplateOptions) {
  const action = buttonHref && buttonText
    ? `<table align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation" width="100%" style="margin-bottom:32px;margin-top:32px;text-align:center"><tbody><tr><td><a href="${buttonHref}" target="_blank" style="line-height:100%;text-decoration:none;display:inline-block;max-width:100%;padding:12px 20px;border-radius:0.25rem;background-color:#007BFF;text-align:center;font-size:12px;font-weight:600;color:#fff">${buttonText}</a></td></tr></tbody></table>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
  <head><meta http-equiv="Content-Type" content="text/html charset=UTF-8" /></head>
  <body style="padding:20px;background-color:#f6f9fc;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif">
    <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">${preview}</div>
    <table align="center" role="presentation" cellSpacing="0" cellPadding="0" border="0" width="100%" style="max-width:465px;margin:80px auto;border-radius:0.25rem;border:1px solid #e5e7eb;background-color:#fff;padding:20px">
      <tr><td>
        <table align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation" width="100%" style="margin-top:32px"><tbody><tr><td>
          <img alt="${companyName}" src="${appLogo}" width="40" height="37" style="display:block;outline:none;border:none;text-decoration:none;margin:0 auto" />
        </td></tr></tbody></table>
        <h1 style="margin:30px 0;padding:0;text-align:center;font-size:24px;font-weight:400;color:#000">${title}</h1>
        ${body}
        ${action}
        <p style="font-size:14px;line-height:24px;margin:16px 0;color:#000">Best,<br />The <strong>${companyName}</strong> Team</p>
      </td></tr>
    </table>
  </body>
</html>`;
}

export const paragraph = (content: string) =>
  `<p style="font-size:14px;line-height:24px;margin:16px 0;color:#000">${content}</p>`;
