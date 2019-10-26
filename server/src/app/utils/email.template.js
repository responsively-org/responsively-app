
export function getSubscriptionEmailContent(options){
    let emailTemplate=`
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html style="width:100%;font-family:Montserrat, Helvetica, Roboto, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0;">

<head>
  <meta charset="UTF-8">
  <meta content="width=device-width, initial-scale=1" name="viewport">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta content="telephone=no" name="format-detection">
  <title>New email template 2019-10-25</title>
  <!--[if (mso 16)]><style type="text/css"> a {text-decoration: none;} </style><![endif]-->
  <!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]-->
  <!--[if !mso]><!-- -->
  <link href="https://fonts.googleapis.com/css?family=Montserrat:500,800" rel="stylesheet">
  <!--<![endif]-->
  <style type="text/css">
    @media only screen and (max-width:600px) {
      u+#body {
        width: 100vw!important
      }
      p,
      ul li,
      ol li,
      a {
        font-size: 16px!important;
        line-height: 150%!important
      }
      h1 {
        font-size: 30px!important;
        text-align: center;
        line-height: 120%!important
      }
      h2 {
        font-size: 26px!important;
        text-align: center;
        line-height: 120%!important
      }
      h3 {
        font-size: 20px!important;
        text-align: center;
        line-height: 120%!important
      }
      h1 a {
        font-size: 30px!important
      }
      h2 a {
        font-size: 26px!important
      }
      h3 a {
        font-size: 20px!important
      }
      .es-menu td a {
        font-size: 16px!important
      }
      .es-header-body p,
      .es-header-body ul li,
      .es-header-body ol li,
      .es-header-body a {
        font-size: 16px!important
      }
      .es-footer-body p,
      .es-footer-body ul li,
      .es-footer-body ol li,
      .es-footer-body a {
        font-size: 16px!important
      }
      .es-infoblock p,
      .es-infoblock ul li,
      .es-infoblock ol li,
      .es-infoblock a {
        font-size: 12px!important
      }
      *[class="gmail-fix"] {
        display: none!important
      }
      .es-m-txt-c,
      .es-m-txt-c h1,
      .es-m-txt-c h2,
      .es-m-txt-c h3 {
        text-align: center!important
      }
      .es-m-txt-r,
      .es-m-txt-r h1,
      .es-m-txt-r h2,
      .es-m-txt-r h3 {
        text-align: right!important
      }
      .es-m-txt-l,
      .es-m-txt-l h1,
      .es-m-txt-l h2,
      .es-m-txt-l h3 {
        text-align: left!important
      }
      .es-m-txt-r img,
      .es-m-txt-c img,
      .es-m-txt-l img {
        display: inline!important
      }
      .es-button-border {
        display: block!important
      }
      a.es-button {
        font-size: 16px!important;
        display: block!important;
        border-left-width: 0px!important;
        border-right-width: 0px!important
      }
      .es-btn-fw {
        border-width: 10px 0px!important;
        text-align: center!important
      }
      .es-adaptive table,
      .es-btn-fw,
      .es-btn-fw-brdr,
      .es-left,
      .es-right {
        width: 100%!important
      }
      .es-content table,
      .es-header table,
      .es-footer table,
      .es-content,
      .es-footer,
      .es-header {
        width: 100%!important;
        max-width: 600px!important
      }
      .es-adapt-td {
        display: block!important;
        width: 100%!important
      }
      .adapt-img {
        width: 100%!important;
        height: auto!important
      }
      .es-m-p0 {
        padding: 0px!important
      }
      .es-m-p0r {
        padding-right: 0px!important
      }
      .es-m-p0l {
        padding-left: 0px!important
      }
      .es-m-p0t {
        padding-top: 0px!important
      }
      .es-m-p0b {
        padding-bottom: 0!important
      }
      .es-m-p20b {
        padding-bottom: 20px!important
      }
      .es-mobile-hidden,
      .es-hidden {
        display: none!important
      }
      .es-desk-hidden {
        display: table-row!important;
        width: auto!important;
        overflow: visible!important;
        float: none!important;
        max-height: inherit!important;
        line-height: inherit!important
      }
      .es-desk-menu-hidden {
        display: table-cell!important
      }
      table.es-table-not-adapt,
      .esd-block-html table {
        width: auto!important
      }
      table.es-social {
        display: inline-block!important
      }
      table.es-social td {
        display: inline-block!important
      }
    }

    input[type="submit"] {
      -webkit-appearance: none;
    }

    #myList div table:nth-child(2n+1),
    #myList2 div table:nth-child(2n+1) {
      float: left;
    }

    #myList div table:nth-child(2n),
    #myList2 div table:nth-child(2n) {
      float: right;
    }

    #outlook a {
      padding: 0;
    }

    .ExternalClass {
      width: 100%;
    }

    .ExternalClass,
    .ExternalClass p,
    .ExternalClass span,
    .ExternalClass font,
    .ExternalClass td,
    .ExternalClass div {
      line-height: 100%;
    }

    .es-button {
      mso-style-priority: 100!important;
      text-decoration: none!important;
    }

    a[x-apple-data-detectors] {
      color: inherit!important;
      text-decoration: none!important;
      font-size: inherit!important;
      font-family: inherit!important;
      font-weight: inherit!important;
      line-height: inherit!important;
    }

    .es-desk-hidden {
      display: none;
      float: left;
      overflow: hidden;
      width: 0;
      max-height: 0;
      line-height: 0;
      mso-hide: all;
    }

    a.es-button:hover {
      border-color: #2CB543!important;
      background: #2CB543!important;
    }

    a.es-secondary:hover {
      border-color: #ffffff!important;
      background: #ffffff!important;
    }
  </style>
</head>

<body style="width:100%;font-family:Montserrat, Helvetica, Roboto, Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0;">
  <div class="es-wrapper-color" style="background-color:#F7F7F7;">
    <!--[if gte mso 9]>
			<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
				<v:fill type="tile" color="#F7F7F7"></v:fill>
			</v:background>
		<![endif]-->
    <table cellpadding="0" cellspacing="0" class="es-wrapper" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;">
      <tr style="border-collapse:collapse;">
        <td valign="top" style="padding:0;Margin:0;">
          <table cellpadding="0" cellspacing="0" class="es-header" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:#1D1B26;background-repeat:repeat;background-position:center bottom;">
                  <tr style="border-collapse:collapse;">
                    <td align="left" style="Margin:0;padding-top:20px;padding-left:20px;padding-right:20px;padding-bottom:25px;">
                      <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                        <tr style="border-collapse:collapse;">
                          <td width="560" valign="top" align="center" style="padding:0;Margin:0;">
                            <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px; bottom;">
                              <tr style="border-collapse:collapse;">
                                <td align="center" style="padding:0;Margin:0;">
                                  <a href="${options.WEBSITE}" target="_blank" style="display:inline-block;font-weight:600;font-family:Inter UI, BlinkMacSystemFont, Segoe UI, Roboto,Helvetica Neue, Arial, sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;font-size:30px;text-decoration:none;color:#FFFFFF;">
                                    <img src="${options.WEBSITE}/assets/img/responsively-logo.png" alt="Responsively"
                                      title="Responsively" width="70" style="border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;"
                                      class="adapt-img">
                                    Responsively
                                  </a>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <table cellpadding="0" cellspacing="0" class="es-content" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;">
            <tr style="border-collapse:collapse;">
              <td align="center" style="padding:0;Margin:0;">
                <table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0" cellspacing="0" width="600" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;">
                  <tr class="es-visible-simple-html-only" style="border-collapse:collapse;">
                    <td align="left" style="Margin:0;padding-bottom:5px;padding-top:30px;padding-left:30px;padding-right:30px;background-position:center bottom;">
                      <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                        <tr style="border-collapse:collapse;">
                          <td width="540" align="center" valign="top" style="padding:0;Margin:0;">
                            <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                              <tr style="border-collapse:collapse;">
                                <td align="center" style="padding:0;Margin:0;">
                                  <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:16px;font-family:Montserrat, Helvetica, Roboto, Arial, sans-serif;line-height:24px;color:#E06666;">
                                    <br>
                                  </p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr style="border-collapse:collapse;">
                    <td align="left" style="padding:0;Margin:0;padding-top:20px;padding-left:30px;padding-right:30px;background-position:center bottom;">
                      <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                        <tr style="border-collapse:collapse;">
                          <td width="540" align="center" valign="top" style="padding:0;Margin:0;">
                            <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                              <tr style="border-collapse:collapse;">
                                <td align="left" style="padding:0;Margin:0;padding-bottom:5px;">
                                  <h1 style="text-align: center;Margin:0;line-height:38px;mso-line-height-rule:exactly;font-family:Montserrat, Helvetica, Roboto, Arial, sans-serif;font-size:32px;font-style:normal;font-weight:bold;color:#4A4A4A;">Thank you for signing up!</h1>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr style="border-collapse:collapse;">
                      <tr style="border-collapse:collapse;">
                        <td align="left" style="padding:0;Margin:0;padding-top:10px;">
                          <p style="text-align:center;Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:17px;font-family:Montserrat, Helvetica, Roboto, Arial, sans-serif;line-height:26px;color:#4A4A4A;">Welcome to
                            <a target="_blank" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Montserrat, Helvetica, Roboto, Arial, sans-serif;font-size:17px;text-decoration:underline;color:#3B2495;"
                              href="${options.WEBSITE}">Responsively</a>. Your license is activated.</p>
                        </td>
                      </tr>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <table cellpadding="0" cellspacing="0" class="es-content" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;">
            <tr style="border-collapse:collapse;">
              <td align="center" style="padding:0;Margin:0;">
                <table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0" cellspacing="0" width="600" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;">
                  <tr style="border-collapse:collapse;">
                    <td align="left" style="Margin:0;padding-left:10px;padding-top:20px;padding-bottom:20px;padding-right:20px;background-position:left top;background-color:#FFFFFF;border-radius:13px;"
                      bgcolor="#ffffff">
                      <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                        <tr style="border-collapse:collapse;">
                          <td width="570" align="left" style="padding:0;Margin:0;">
                            <table cellpadding="0" cellspacing="0" border="1" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                              <tr style="border-collapse:collapse;">
                                <td align="left" style="padding:0;Margin:0;padding-top:5px;padding-bottom:5px;">
                                  Plan:
                                </td>
                                <td align="left" style="padding:0;Margin:0;padding-top:5px;padding-bottom:5px;">
                                    ${options.planName}
                                  </td>
                              </tr>
                              <tr style="border-collapse:collapse;">
                                  <td align="left" style="padding:0;Margin:0;padding-top:5px;padding-bottom:5px;">
                                    Max Concurrent Devices:
                                  </td>
                                  <td align="left" style="padding:0;Margin:0;padding-top:5px;padding-bottom:5px;">
                                      ${options.maxConcurrentDevices}
                                    </td>
                                </tr>
                                <tr style="border-collapse:collapse;">
                                    <td align="left" style="padding:0;Margin:0;padding-top:5px;padding-bottom:5px;">
                                      License Key:
                                    </td>
                                    <td align="left" style="padding:0;Margin:0;padding-top:5px;padding-bottom:5px;">
                                        ${options.licenseKey}
                                      </td>
                                  </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <table cellpadding="0" cellspacing="0" class="es-content" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;">
            <tr style="border-collapse:collapse;">
              <td align="center" style="padding:0;Margin:0;">
                <table class="es-content-body" width="600" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;">
                </table>
              </td>
            </tr>
          </table>
          <table cellpadding="0" cellspacing="0" class="es-content" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;">
            <tr style="border-collapse:collapse;">
              <td align="center" style="padding:0;Margin:0;">
                <table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0" cellspacing="0" width="600" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;">
                </table>
              </td>
            </tr>
          </table>
          <table cellpadding="0" cellspacing="0" class="es-content" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;">
            <tr style="border-collapse:collapse;">
              <td align="center" style="padding:0;Margin:0;">
                <table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0" cellspacing="0" width="600" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;">
                  <tr style="border-collapse:collapse;">
                    <td align="left" style="Margin:0;padding-top:15px;padding-bottom:25px;padding-left:30px;padding-right:30px;background-position:center bottom;">
                      <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                        <tr style="border-collapse:collapse;">
                          <td width="540" align="center" valign="top" style="padding:0;Margin:0;">
                            <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                              <tr style="border-collapse:collapse;">
                                <td align="center" class="es-m-txt-l" style="padding:0;Margin:0;padding-top:10px;">
                                  <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:Montserrat, Helvetica, Roboto, Arial, sans-serif;line-height:21px;color:#4A4A4A;">If you have any questions or suggestions, please contact
                                    <a target="_blank" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Montserrat, Helvetica, Roboto, Arial, sans-serif;font-size:14px;text-decoration:underline;color:#3B2495;"
                                      href="">support@responsively.app</a> or via <a href="${options.WEBSITE}">Chat</a> - we will be happy to assist you!</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <table cellpadding="0" cellspacing="0" class="es-content" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;">
            <tr style="border-collapse:collapse;">
              <td align="center" bgcolor="#1D1B26" style="padding:0;Margin:0;background-color:#1D1B26;">
                <table bgcolor="rgba(0, 0, 0, 0)" class="es-content-body" align="center" cellpadding="0" cellspacing="0" width="600" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;">
                  <tr style="border-collapse:collapse;">
                    <td align="left" style="padding:0;Margin:0;padding-bottom:30px;padding-top:40px;">
                      <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                        <tr style="border-collapse:collapse;">
                          <td width="600" align="center" valign="top" style="padding:0;Margin:0;">
                            <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                              <tr style="border-collapse:collapse;">
                                <td align="center" class="es-m-txt-c" style="padding:0;Margin:0;">
                                  <table cellpadding="0" cellspacing="0" class="es-table-not-adapt es-social" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                                    <tr style="border-collapse:collapse;">
                                      <td align="center" valign="top" style="padding:0;Margin:0;padding-right:10px;">
                                        <img title="Facebook" src="https://esputnik.com/content/stripostatic/assets/img/social-icons/logo-white/facebook-logo-white.png"
                                          alt="Fb" width="32" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;">
                                      </td>
                                      <td align="center" valign="top" style="padding:0;Margin:0;padding-right:10px;">
                                        <img title="Twitter" src="https://esputnik.com/content/stripostatic/assets/img/social-icons/logo-white/twitter-logo-white.png"
                                          alt="Tw" width="32" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;">
                                      </td>
                                      <td align="center" valign="top" style="padding:0;Margin:0;">
                                        <img title="Linkedin" src="https://esputnik.com/content/stripostatic/assets/img/social-icons/logo-white/linkedin-logo-white.png"
                                          alt="In" width="32" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;">
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr style="border-collapse:collapse;">
                    <td align="left" style="padding:0;Margin:0;padding-bottom:30px;padding-left:30px;padding-right:30px;background-position:center bottom;">
                      <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                        <tr style="border-collapse:collapse;">
                          <td width="540" align="center" valign="top" style="padding:0;Margin:0;">
                            <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                              <tr style="border-collapse:collapse;">
                                <td align="center" class="es-infoblock" style="padding:0;Margin:0;line-height:14px;font-size:12px;color:#CCCCCC;">
                                  <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:12px;font-family:Montserrat, Helvetica, Roboto, Arial, sans-serif;line-height:18px;color:#CCCCCC;">You are receiving this email because you have subscribed to the above plan.
                                    Incase you did not, please ignore this mail or contact <a style="color:#ffffff">support@responsively.app</a>.</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>

</html>
`
return emailTemplate
}