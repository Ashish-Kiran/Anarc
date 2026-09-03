function Footer() {
    return (
      <footer className="w-full bg-[#050a13] text-white box-border border-t border-[rgba(75,210,255,0.12)]">
        <div
          className="
            max-w-[1350px] mx-auto
            px-10 pt-[90px] pb-[70px]
            grid grid-cols-[1.5fr_1fr_1fr_1.25fr] gap-[70px]
            max-[1000px]:grid-cols-[1.5fr_1fr_1fr] max-[1000px]:gap-y-[60px]
            max-[650px]:flex max-[650px]:flex-col max-[650px]:gap-[45px]
            max-[650px]:px-[25px] max-[650px]:pt-[60px] max-[650px]:pb-[45px]
          "
        >
          {/* Brand */}
          <div className="flex flex-col items-start max-[1000px]:col-span-full max-[650px]:w-full">
            <div className="w-[150px] mb-[18px]">
              <img src="../AnarcLogo.png" alt="ANARC" className="w-full h-auto block object-contain" />
            </div>
  
            <h2 className="m-0 text-[22px] leading-[1.15] font-bold tracking-[0.5px] text-[#f2f7ff]">
              ANARC
            </h2>
  
            <div className="mt-[7px] text-[15px] font-semibold tracking-[0.5px] text-[#59d9ff]">
              NIT Agartala
            </div>
  
            <p className="max-w-[350px] mt-[35px] mb-0 text-[#8f9bad] text-[15px] leading-[1.7] text-left max-[650px]:mt-[25px]">
              Exploring electronics, robotics and technology through hands-on
              projects, innovation, competitions and collaborative learning.
            </p>
  
            {/* Socials */}
            <div className="flex items-center gap-[18px] mt-[30px]">
              {/* Instagram */}
              <a
                href="#"
                aria-label="Instagram"
                className="w-[22px] h-[22px] flex items-center justify-center text-[#8490a2] no-underline transition-[color,transform] duration-[250ms] ease-in-out hover:text-[#5de1ff] hover:-translate-y-[3px]"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 fill-none stroke-current [stroke-width:1.8]"
                >
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle
                    cx="17.5"
                    cy="6.5"
                    r="1"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
              </a>
  
              {/* GitHub */}
              <a
                href="#"
                aria-label="GitHub"
                className="w-[22px] h-[22px] flex items-center justify-center text-[#8490a2] no-underline transition-[color,transform] duration-[250ms] ease-in-out hover:text-[#5de1ff] hover:-translate-y-[3px]"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current stroke-none">
                  <path
                    d="M12 2C6.48 2 2 6.58 2 12.22
                    c0 4.51 2.87 8.34 6.84 9.69
                    .5.1.68-.22.68-.48
                    0-.24-.01-.88-.01-1.73
                    -2.78.62-3.37-1.38-3.37-1.38
                    -.45-1.18-1.11-1.5-1.11-1.5
                    -.91-.64.07-.63.07-.63
                    1 .07 1.53 1.05 1.53 1.05
                    .9 1.57 2.35 1.12 2.92.86
                    .09-.67.35-1.12.64-1.38
                    -2.22-.26-4.56-1.14-4.56-5.05
                    0-1.12.39-2.03 1.03-2.75
                    -.1-.26-.45-1.3.1-2.7
                    0 0 .84-.28 2.75 1.05
                    .8-.23 1.65-.35 2.5-.35
                    .85 0 1.7.12 2.5.35
                    1.91-1.33 2.75-1.05 2.75-1.05
                    .55 1.4.2 2.44.1 2.7
                    .64.72 1.03 1.63 1.03 2.75
                    0 3.92-2.34 4.78-4.57 5.04
                    .36.32.68.95.68 1.92
                    0 1.38-.01 2.49-.01 2.83
                    0 .27.18.59.69.48
                    A10.22 10.22 0 0 0 22 12.22
                    C22 6.58 17.52 2 12 2Z"
                  />
                </svg>
              </a>
  
              {/* LinkedIn */}
              <a
                href="#"
                aria-label="LinkedIn"
                className="w-[22px] h-[22px] flex items-center justify-center text-[#8490a2] no-underline transition-[color,transform] duration-[250ms] ease-in-out hover:text-[#5de1ff] hover:-translate-y-[3px]"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current stroke-none">
                  <path
                    d="M6.5 8.5H3V21h3.5V8.5ZM4.75 3
                    C3.65 3 3 3.72 3 4.65
                    S3.65 6.3 4.73 6.3h.02
                    C5.85 6.3 6.5 5.58 6.5 4.65
                    6.48 3.72 5.85 3 4.75 3ZM21 13.84
                    c0-3.77-2.01-5.53-4.69-5.53
                    -2.16 0-3.13 1.19-3.67 2.03V8.5H9.15
                    V21h3.49v-6.16c0-1.63.31-3.21 2.33-3.21
                    1.99 0 2.02 1.87 2.02 3.32V21H21v-7.16Z"
                  />
                </svg>
              </a>
            </div>
          </div>
  
          {/* Quick Links */}
          <div className="flex flex-col items-start max-[650px]:w-full">
            <h3 className="mb-[25px] text-[18px] font-semibold text-[#f3f7ff]">
              Quick Links
            </h3>
            {["Home", "Events", "Team", "Projects", "Contact"].map((label) => (
              <a
                key={label}
                href="#"
                className="mb-[17px] text-[#8f9bad] no-underline text-[15px] leading-[1.4] transition-[color,transform] duration-[500ms] ease-in-out hover:text-white hover:translate-x-1 before:content-['›'] before:mr-[10px] before:text-[#566477] before:text-[19px] before:transition-colors before:duration-[250ms] hover:before:text-[#55dfff]"
              >
                {label}
              </a>
            ))}
          </div>
  
          {/* Resources */}
          <div className="flex flex-col items-start max-[650px]:w-full">
            <h3 className="mb-[25px] text-[18px] font-semibold text-[#f3f7ff]">
              Resources
            </h3>
            {[
              "Learning Resources",
              "Workshop Materials",
              "Projects",
              "Documentation",
            ].map((label) => (
              <a
                key={label}
                href="#"
                className="mb-[17px] text-[#8f9bad] no-underline text-[15px] leading-[1.4] transition-[color,transform] duration-[250ms] ease-in-out hover:text-white hover:translate-x-1 before:content-['›'] before:mr-[10px] before:text-[#566477] before:text-[19px] before:transition-colors before:duration-[250ms] hover:before:text-[#55dfff]"
              >
                {label}
              </a>
            ))}
          </div>
  
          {/* NIT Agartala */}
          <div className="flex flex-col items-start max-[650px]:w-full">
            <h3 className="mb-[25px] text-[18px] font-semibold text-[#f3f7ff]">
              NIT Agartala
            </h3>
  
            <a
              href="#"
              className="mb-[17px] text-[#8f9bad] no-underline text-[15px] leading-[1.4] transition-[color,transform] duration-[250ms] ease-in-out hover:text-white hover:translate-x-1"
            >
              Institute Website
            </a>
  
            <a
              href="#"
              className="mb-[17px] text-[#8f9bad] no-underline text-[15px] leading-[1.4] transition-[color,transform] duration-[250ms] ease-in-out hover:text-white hover:translate-x-1"
            >
              NIT Agartala
            </a>
  
            <p className="mt-[10px] text-[#727e91] text-[14px] leading-[1.7]">
              Jirania, West Tripura
              <br />
              Tripura – 799046
            </p>
          </div>
        </div>
  
        {/* Bottom of Footer */}
        <div
          className="
            max-w-[1350px] mx-auto
            px-10 pt-[28px] pb-[35px]
            border-t border-[rgba(100,180,220,0.1)]
            flex items-center justify-between gap-[30px]
            text-[#626e81] text-[14px]
            max-[650px]:px-[25px] max-[650px]:pt-[25px] max-[650px]:pb-[25px]
            max-[650px]:flex-col max-[650px]:items-start max-[650px]:gap-[12px]
            max-[650px]:text-[13px]
          "
        >
          <p className="m-0">© 2012 Anarc, NIT Agartala. All rights reserved.</p>
  
          <p className="m-0">
            Made with
            <span className="mx-[5px] text-[#55dfff] text-[19px] relative -top-[0px] inline-block">
              ♡
            </span>
            by Ashish Kiran
          </p>
        </div>
      </footer>
    );
  }
  
  export default Footer;