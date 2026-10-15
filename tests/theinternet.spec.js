const { test, expect } = require('@playwright/test')
const BASE_URL = "https://the-internet.herokuapp.com/"

test.beforeEach("start instance of browser", async ({ page }) =>
    {
        await page.goto(`${BASE_URL}`)   
    }
);

test("TC01 - Login with valid credentials", async ({page}) =>
{
    await page.getByRole('link', {name: "Form Authentication"}).click()
    await page.locator("#username").fill("tomsmith")
    await page.locator("#password").fill("SuperSecretPassword!")
    await page.getByRole('button', {name: "Login"}).click();
    await expect(page.locator(".subheader")).toHaveText("Welcome to the Secure Area. When you are done click logout below.");
    await page.getByRole('link', {name: "Logout"}).click();
    await expect(page.locator("#flash")).toContainText("You logged out of the secure area!");
})

test("TC02 - Login with invalid credentials", async ({page}) => 
{
    await page.getByRole('link', {name: "Form Authentication"}).click()
    await page.locator("#username").fill("tomsmith")
    await page.locator("#password").fill("SecretPassword!")
    await page.getByRole('button', {name: "Login"}).click();
    await expect(page.locator("#flash")).toContainText("Your password is invalid!");

});

test("TC03 - check both checkboxes", async ({page}) => 
{
    await page.getByRole('link', {name: "Checkboxes"}).click()
    const checkbox1 = await page.locator("form input").first();
    const checkbox2 = await page.locator("form input").last();
    await checkbox1.check();
    await expect(checkbox1).toBeChecked()
    await expect(checkbox2).toBeChecked()
    await checkbox1.uncheck();
    await checkbox2.uncheck();
    await expect(checkbox1).not.toBeChecked()
    await expect(checkbox2).not.toBeChecked()

});

test("TC04 - dropdown verification", async ({page}) => 
{
    await page.getByRole('link', {name: "Dropdown", exact: true}).click()
    const dropdown = await page.locator("#dropdown");
    await dropdown.selectOption({value: "1"});
    await expect(dropdown.locator("option:checked")).toHaveText("Option 1")
    await dropdown.selectOption({value: "2"});
    await expect(dropdown.locator("option:checked")).toHaveText("Option 2")   
    await expect(dropdown.locator("option:checked")).not.toHaveText("Option 1") 
});

test("TC05 - dropdown verification", async ({page}) => 
{
    await page.getByRole('link', {name: "Dynamic Loading"}).click();
    await page.getByRole('link', {name: "Example 1: Element on page that is hidden"}).click();
    await page.getByRole('button', {name: "Start"}).click();
    const helloWorld = await page.locator("h4").filter({hasText: "Hello World!"});
    await helloWorld.waitFor({state: 'visible', timeout: 10000});
    await expect(helloWorld).toBeVisible();
    await expect(helloWorld).toHaveText("Hello World!")
     
});

test("TC06 - Handle JS Alert", async ({page}) => 
{
    await page.getByRole('link', {name: "JavaScript Alerts"}).click();

    const JSAlert = await page.getByText("Click for JS Alert");

    page.once('dialog', dialog => dialog.accept());
    await JSAlert.click();
    await expect(page.locator("#result")).toHaveText("You successfully clicked an alert");

    page.once('dialog', dialog => dialog.accept());

    const JSConfirm = await page.getByText("Click for JS Confirm");

    await JSConfirm.click();
    await expect(page.locator("#result")).toHaveText("You clicked: Ok");

    page.once('dialog', dialog => dialog.dismiss());

    await JSConfirm.click();
    await expect(page.locator("#result")).toHaveText("You clicked: Cancel");
    
    page.once('dialog', dialog => dialog.accept("Playwright Testing"));
    const JSPrompt = await page.getByText("Click for JS Prompt");
    await JSPrompt.click();

    await expect(page.locator("#result")).toHaveText("You entered: Playwright Testing");
});

test("TC07 - New Window", async ({page}) => 
{
    const popupPromise = page.waitForEvent('popup');
    await page.getByRole('link', {name: "Multiple Windows"}).click();
    await page.getByRole('link', {name: "Click Here"}).click();
    const newPage = await popupPromise;
    await expect(newPage.locator("h3")).toHaveText("New Window");
    await expect(page.locator("h3")).toHaveText("Opening a new window");
    await newPage.close();
    await expect(page.locator("h3")).toHaveText("Opening a new window");
});

test("TC08 - Upload Sample Text File", async ({page}) => 
{
    
    await page.getByRole('link', {name: "File Upload"}).click();
    await page.locator("#file-upload").setInputFiles("./testUpload.txt");
    await page.locator("#file-submit").click();

    await expect(page.locator("h3")).toHaveText("File Uploaded!")
    await expect(page.locator("#uploaded-files")).toHaveText("testUpload.txt")
    
});

test("TC09 - Download Sample Text File", async ({page}) => 
{
    const fs = require('fs');
    await page.getByRole('link', {name: "File Download", exact: true}).click();

    // Start listening for download
    const downloadPromise = page.waitForEvent('download');

    // Click the file to start the download
    await page.getByText('Resume (12).pdf').click();

    // Capture the download
    const download = await downloadPromise;

    // Verify filename
    expect(download.suggestedFilename()).toBe('Resume (12).pdf');

    // Save the file
    await download.saveAs('downloads/Resume (12).pdf');

    // Verify the file exists in local
    await expect(fs.existsSync('downloads/Resume (12).pdf')).toBeTruthy();
    
});

test("TC10 - Dynamic Controls", async ({page}) => 
{
    // Section A
    await page.getByRole('link', {name: "Dynamic Controls", exact: true}).click();
    await expect(page.locator("#checkbox")).toBeVisible();
    await page.getByRole('button', {name: "Remove"}).click();
    await expect(page.locator("#checkbox")).toBeHidden();
    await expect(page.locator("#message")).toHaveText("It's gone!");
    await page.getByRole('button', {name: "Add"}).click();
    await expect(page.locator("#checkbox")).toBeVisible();
    await expect(page.locator("#message")).toHaveText("It's back!");

    // Section B
    await expect(page.locator("input[type='text']")).toBeDisabled();
    await page.getByRole('button', {name: "Enable"}).click();
    await expect(page.locator("input[type='text']")).toBeEnabled();
    await page.locator("input[type='text']").fill("Playwright");
    await page.getByRole('button', {name: "Disable"}).click();
    await expect(page.locator("input[type='text']")).toBeDisabled();
});

test("TC11 - iFrames", async ({page}) => 
{
    // Section A
    await page.getByRole('link', {name: "Frames", exact:true}).click();
    await page.getByRole('link', {name: "iFrame"}).click();
    await expect(page.locator("h3")).toHaveText("An iFrame containing the TinyMCE WYSIWYG Editor");

    const frame = page.frameLocator("#mce_0_ifr");
    await frame.locator("#tinymce").clear();
    await frame.locator("#tinymce").fill("Learning Playwright Automation");
    await expect(frame.locator("#tinymce")).toHaveText("Learning Playwright Automation");
});

test("TC12 - Sortable Data Tables", async ({page}) => 
{
    // Scenario A — Table Validation
    await page.getByRole('link', {name: "Sortable Data Tables"}).click();
    const table1 = await page.locator("#table1");
    await expect(table1.locator("tr")).toHaveCount(5);
    const rowData = table1.locator("tr").filter({hasText: "smith"}).locator("td").nth(2);
    await expect(rowData).toHaveText("jsmith@gmail.com")

    // Scenario B — Sorting
    const table2 = await page.locator("#table2");
    const lastNameSort = page.getByText("Last Name").last()
    await lastNameSort.click();
    await lastNameSort.click();
    const rowCount = await page.locator("#table2").locator("tr").count();
    const surnames = [];
    
    for(let i = 0; i < rowCount - 1; ++i) {
        const surname = await table2.locator("tbody tr").nth(i).locator("td").nth(0).innerText();
        surnames.push(surname)
    }
    
    for (let i = 0; i < surnames.length - 1; i++) {
    expect(surnames[i] <= surnames[i + 1]).toBe(true);
    }

    // Scenario C — Extract Table Data
    let totalBalance = 0

    for(let i = 0; i < rowCount - 1; ++i){
        const amountTable1 = await table1.locator("tbody tr").nth(i).locator("td").nth(3).innerText();
        const owed = amountTable1.replace("$", "");
        totalBalance += parseFloat(owed)

    }
    expect(totalBalance).toEqual(251);
    
});


// [x] TC01 — Log in using valid credentials and verify the success message. Then log out.
// [x] TC02 — Attempt login with an incorrect password and verify the error message.
// [x] TC03 — Check both checkboxes, verify their states, then uncheck both.
// [x] TC04 — Select Option 1, verify it, then select Option 2 and verify again.
// [x] TC05 — Open Example 1, click Start, and verify that Hello World! becomes visible.
// [x] TC06 — Handle a JS Alert, JS Confirm (accept and dismiss), and JS Prompt (enter text). Verify each result.
// [x] TC07 — Click the link to open a new window and verify the heading in the new page.
// [x] TC08 — Upload a sample text file and verify that its filename appears on the confirmation page.
// [x] TC09 — Download a file and verify that the download is created with a valid filename.
// [x] TC10 — Dynamic Controls - Remove a checkbox, verify its disappearance, add it again, and verify its visibility. 
// [x] TC11 — Switch into the iframe on the Frames → iFrame page and interact with the editable text area.
// [ ] TC12 — Extract values from a table, locate a specific row by surname, and verify the corresponding email address.

// For this project:
// - Use JavaScript with @playwright/test.
// - Create separate test() blocks for each test case.
// - Use test.beforeEach() where appropriate.
// - Use Playwright assertions to validate actual results.
// - Avoid waitForTimeout() where possible.
// - Don't use Page Object Model yet. Focus on understanding the different interactions.
// Additional challenge: Run the suite in Chromium and Firefox, and generate an HTML test report.