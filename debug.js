const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Capture console errors
    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push({ text: msg.text(), location: msg.location() });
            console.log(`[CONSOLE ERROR] ${msg.text()}`);
        }
    });

    // Capture failed requests
    const failedRequests = [];
    page.on('requestfailed', request => {
        failedRequests.push({ url: request.url(), failure: request.failure() });
        console.log(`[REQUEST FAILED] ${request.url()} - ${request.failure().errorText}`);
    });

    // Navigate to the app
    console.log('Opening http://localhost:3000 ...');
    const response = await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 10000 });
    console.log(`Page loaded with status: ${response.status()}`);

    // Wait a bit for any async operations
    await page.waitForTimeout(3000);

    // Take screenshot
    await page.screenshot({ path: '/tmp/autopart-screenshot.png', fullPage: true });
    console.log('Screenshot saved to /tmp/autopart-screenshot.png');

    // Check if loading screen is still visible
    const loadingVisible = await page.isVisible('#loading-screen');
    console.log(`Loading screen visible: ${loadingVisible}`);

    // Check if login form is visible
    const loginVisible = await page.isVisible('#login-form');
    console.log(`Login form visible: ${loginVisible}`);

    // Check if dashboard is visible
    const dashboardVisible = await page.isVisible('#dash-content');
    console.log(`Dashboard visible: ${dashboardVisible}`);

    // Get page content
    const title = await page.title();
    console.log(`Page title: ${title}`);

    // Check for any error messages in the page
    const errorTexts = await page.locator('.text-red-600, .text-red-500, .error').allTextContents();
    if (errorTexts.length > 0) {
        console.log('Error messages found:', errorTexts);
    }

    console.log('\n=== Summary ===');
    console.log(`Console errors: ${errors.length}`);
    console.log(`Failed requests: ${failedRequests.length}`);
    
    if (errors.length > 0) {
        console.log('\n=== Console Errors ===');
        errors.forEach(e => console.log(`- ${e.text}`));
    }
    
    if (failedRequests.length > 0) {
        console.log('\n=== Failed Requests ===');
        failedRequests.forEach(f => console.log(`- ${f.url}: ${f.failure.errorText}`));
    }

    await browser.close();

    if (errors.length > 0 || failedRequests.length > 0) {
        process.exit(1);
    }
})();
