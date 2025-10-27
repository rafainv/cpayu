const { connect } = require("puppeteer-real-browser");
const fs = require("fs");

const URL = process.env.URL;
const COOKIES_PATH = "cookies.json";
const LOCALSTORAGE_PATH = "localstorage.json";

const cpayu = async () => {
  const { page, browser } = await connect({
    args: ["--start-maximized"],
    turnstile: true,
    headless: false,
    // disableXvfb: true,
    customConfig: {},
    connectOption: {
      defaultViewport: null,
    },
    plugins: [],
  });

  try {
    await page.goto(URL, { waitUntil: "networkidle2" });

    await new Promise((r) => setTimeout(r, 2000));

    if (fs.existsSync(COOKIES_PATH)) {
      let cookies = JSON.parse(fs.readFileSync(COOKIES_PATH));
      cookies = cookies.map((c) => ({
        ...c,
        expires: c.expires ? Math.floor(c.expires) : undefined,
      }));
      await page.setCookie(...cookies);
    }

    if (fs.existsSync(LOCALSTORAGE_PATH)) {
      const localData = JSON.parse(fs.readFileSync(LOCALSTORAGE_PATH));
      await page.evaluate((data) => {
        for (const k in data) localStorage.setItem(k, data[k]);
      }, localData);
    }

    await new Promise((r) => setTimeout(r, 2000));

    await page.goto(`${URL}/dashboard/ads_surf`, { waitUntil: "networkidle2" });

    await new Promise((r) => setTimeout(r, 5000));

    // const ads = await page.evaluate(() => {
    //   const clicar = document.querySelectorAll(
    //     ".text-overflow.ags-description > img"
    //   );
    //   const links = [];
    //   clicar.forEach((ad, index) => {
    //     if (ad.style.filter === "opacity(1)") {
    //       links.push(index);
    //     }
    //   });
    //   return links;
    // });

    // for (let id of ads) {
    //   console.log(`Clicando no anúncio ${id}...`);
    //   await page.evaluate((id) => {
    //     document
    //       .querySelectorAll(".text-overflow.ags-description > img")
    //       [id].click();
    //   }, id);
    //   await new Promise((r) => setTimeout(r, 5000));
    //   const pages = await browser.pages();
    //   if (pages.length > 0) {
    //     const title = await pages[0].title();
    //     try {
    //       const seg = title.match(/\d+/);
    //       await new Promise((r) => setTimeout(r, seg[0] * 1000 + 5000));
    //       await pages[pages.length - 1].close();
    //     } catch (e) {}
    //   }
    // }

    console.log("OK");

    await new Promise((r) => setTimeout(r, 2000));
    await page.screenshot({ path: "screen.png" });
  } catch (error) {
    console.error(`Erro interno do servidor: ${error.message}`);
    await new Promise((r) => setTimeout(r, 5000));
    await cpayu();
  } finally {
    await browser.close();
  }
};

cpayu();
