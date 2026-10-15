const { test, expect } = require('@playwright/test');
const { text } = require('node:stream/consumers');
const BASE_URL = "https://www.saucedemo.com/"
const userData = {username: "standard_user", password: "secret_sauce"}

test('Sauce Lab. Test 1', async ({browser}) =>
{   
    const context = await browser.newContext();
    const page = await context.newPage();

    // TC01 
    await page.goto(`${BASE_URL}`);
    await expect(page.locator("#login_button_container")).toBeVisible();

    // TC02
    await page.locator("#user-name").fill(userData.username);
    await page.locator("#password").fill(userData.password);
    await page.locator("#login-button").click();
    await expect(page).toHaveURL(/inventory/);

    // TC03  
    await page.locator("#react-burger-menu-btn").click();
    await page.locator("#logout_sidebar_link").click();
    await page.locator("#user-name").fill(userData.username);
    await page.locator("#password").fill("pass");
    await page.locator("#login-button").click();
    await expect(page.locator(".login-box h3")).toHaveText(
    "Epic sadface: Username and password do not match any user in this service"
);
    // TC04
    await page.locator("#user-name").fill(userData.username);
    await page.locator("#password").fill(userData.password);
    await page.locator("#login-button").click();
    await page.waitForLoadState('networkidle')
    await expect(page.locator(".inventory_item").first()).toBeVisible();

    // TC05
    await page.locator(".product_sort_container").click();
    await page.locator(".product_sort_container").selectOption({label: "Price (low to high)"});
    
    const price = await page.locator(".inventory_item_price");
    const count = await price.count();
    expect(count).toBeGreaterThan(1);

    for(let i = 0; i < count - 1; ++i){
        const currentPrice = Number((await price.nth(i).innerText()).replace("$", ""))
        const nextPrice = Number((await price.nth(i + 1).innerText()).replace("$", ""))
        expect(currentPrice).toBeLessThanOrEqual(nextPrice);
    }

    // TC06
    await page.getByRole("button", { name: "Add to cart" }).first().click();
    await page.getByRole("button", { name: "Add to cart" }).first().click();
    await expect(page.locator(".shopping_cart_badge")).toHaveText("2");

    // TC07
    await page.locator(".shopping_cart_link").click();
    await page.getByRole('button', {name: "remove"}).first().click();
    await expect(page.locator(".shopping_cart_badge")).toHaveText("1");

    // TC08
    await page.locator("#checkout").click();
    await page.locator("#first-name").fill("Dummy");
    await page.locator("#last-name").fill("User");
    await page.locator("#postal-code").fill("90210");
    await page.locator("#continue").click();
    await page.locator("#finish").click();

    // TC09
    await expect(page.locator(".complete-header")).toHaveText("Thank you for your order!");

    // TC10
    await page.locator("#react-burger-menu-btn").click();
    await page.locator("#logout_sidebar_link").click();
    await expect(page.locator("#login_button_container")).toBeVisible();
});



// [x] TC01: Open the login page and verify the login form is visible.
// [x] TC02: Log in using valid credentials and verify navigation to the inventory page.
// [x] TC03: Attempt login with an invalid password and verify the error message.
// [x] TC04: Verify that the inventory page displays products.
// [x] TC05: Sort products by price (low to high) and verify their order.
// [x] TC06: Add two products to the cart and verify the cart badge displays 2.
// [x] TC07: Remove one product and verify the cart updates.
// [x] TC08: Complete checkout using dummy customer information.
// [x] TC09: Verify the order confirmation message.
// [x] TC10: Log out and verify the login page is displayed.