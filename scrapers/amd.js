const PRODUCT_ELEM = "shop-content";
const PRODUCT_TITLE = ".shop-title";
const PRODUCT_LINKS = ".shop-links";
const PRODUCT_PRICE = ".shop-price";
const PRODUCT_HREF = ".shop-full-specs-link";
const PAGE_URL = "https://www.amd.com/en/direct-buy/fi";
const USERAGENT =
  "Mozilla/5.0 (X11; Linux x86_64) " +
  "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36";
async function run(browser, searchTerm) {
  const page = await browser.newPage();
  // Site doesn't render if default useragent
  await page.setUserAgent(USERAGENT);
  await page.goto(PAGE_URL, {
    waitUntil: "networkidle2",
  });
  console.log(`Page ${PAGE_URL} loaded`);

  // Get product containing the search term from the page
  const availableProducts = await page.evaluate(
    (
      searchTerm,
      productElemSelector,
      productTitleSelector,
      productLinksSelector,
      productPriceSelector,
      productHrefSelector
    ) => {
      const wantedProducts = [];
      const items = Array.from(
        document.getElementsByClassName(productElemSelector)
      );

      items.forEach((elem) => {
        const productTitle = elem.querySelector(productTitleSelector).innerText;
        const productLink = elem.querySelector(productLinksSelector).innerText;
        const productPrice = elem.querySelector(productPriceSelector).innerText;
        const productHref = elem
          .querySelector(productHrefSelector)
          .querySelector("a").href;
        if (
          productTitle.toLowerCase().includes(searchTerm) &&
          productLink.toLowerCase().includes("add")
        ) {
          producObject = {
            title: productTitle,
            price: productPrice,
            statusLink: productLink,
            directLink: productHref,
          };
          wantedProducts.push(producObject);
        }
      });
      return wantedProducts;
    },
    searchTerm,
    PRODUCT_ELEM,
    PRODUCT_TITLE,
    PRODUCT_LINKS,
    PRODUCT_PRICE,
    PRODUCT_HREF
  );

  if (availableProducts.length > 0) {
    console.log(
      `Available number of products on ${PAGE_URL}: ${availableProducts.length}`
    );
  }

  page.close();

  return availableProducts;
}

exports.checkAvailability = run;
