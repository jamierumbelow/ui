`use strict`;

let method = ``;

// For message signing:
let from = ``;
let params = {};

browser.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (typeof request.message === `undefined`) return;

    switch (request.message.message) {
        case `eth_requestAccounts`: // * Return requested data from native app to popup.js
            const address = await browser.runtime.sendNativeMessage(`eth_requestAccounts`);
            // TODO: address could return a { error: 'error message' } object. We need to check for that
//            if address['error'] = `undefined` {
//                ...
//            }
            browser.runtime.sendMessage({
                message: address,
            });
            break;
        case `eth_signTypedData_v3`: // * Return requested data from native app to popup.js
            /*
            TODO
            const signature = await browser.runtime.sendNativeMessage({
                from: request.message.from,
                message: `eth_signTypedData_v3`,
                params: request.message.params,
            });
            browser.runtime.sendMessage({
                message: signature.message,
            });
            */
            break;
        case `cancel`: // * Cancel current method and notify popup.js of cancellation
            browser.runtime.sendMessage({
                message: {
                    message: `cancel`,
                },
            });
            break;
        case `get_state`: // * Send current method, address, balance, and network (?) to popup.js
            const currentAddress = await browser.runtime.sendNativeMessage(`eth_getAccounts`);
            const balance = await browser.runtime.sendNativeMessage(`eth_getBalance`);
            console.log(`currentAddress response: `, currentAddress)
            console.log(`currentBalance response: `, balance)
            // TODO: address could return a { error: 'error message' } object. We need to check for that 
            browser.runtime.sendMessage({
                message: {
                    address: currentAddress[0],
                    balance: balance,
                    from,
                    method,
                    params,
                },
            });
            break;
        case `update_method`: // * Update current method from content.js
            method = request.message.method === `cancel`
                ? ``
                : request.message.method;
            break;
        case `update_from`: // * Update "from" for message signing from content.js
            from = request.message.from;
            break;
        case `update_params`: // * Update "params" for message signing from content.js
            params = request.message.params;
            break;
        default: // * Unimplemented or invalid method
            console.log(`background [unimplemented]:`, request.message.message);
    }
});
