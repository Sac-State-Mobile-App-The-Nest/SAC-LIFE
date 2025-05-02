/**
 * @jest-environment jsdom
 */
const { verifyEmail } = require('./script');

describe('verifyEmail', () => {
    let statusEl;

    beforeEach(() => {
        // Set up the mock status element
        document.body.innerHTML = `<div id="status"></div>`;
        statusEl = document.getElementById('status');
    });

    it('shows "Invalid verification link." if no token is provided', async () => {

        delete window.location;
        window.location = new URL('https://example.com/');
        await verifyEmail();
        expect(statusEl.textContent).toBe("Invalid verification link.");
    });

    it('shows success message on valid token', async () => {
        // Mock fetch
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ message: "Email successfully verified" }),
            })
        );

        delete window.location;
        window.location = new URL('https://example.com/?token=validToken');

        await verifyEmail();
        // Wait for promise chain to complete
        await new Promise(process.nextTick);
        expect(statusEl.textContent).toBe("Email successfully verified");
    });

    it('shows error message if token is invalid or expired', async () => {
        global.fetch = jest.fn(() =>
          Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ message: "Invalid or expired verification token" }),
          })
        );
      
        // Set up a URL with a bad token
        delete window.location;
        window.location = new URL('https://example.com/?token=badToken');
      
        await verifyEmail();
        await new Promise(process.nextTick);
      
        expect(statusEl.textContent).toBe("Verification failed or link expired.");
      });
      

    it('shows error on failed fetch', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false
            })
        );

        await verifyEmail();
        await new Promise(process.nextTick);
        expect(statusEl.textContent).toBe("Verification failed or link expired.");
    });
});
