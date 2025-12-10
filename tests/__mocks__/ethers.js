// Manual mock for ethers module
// This mock is loaded by Jest via moduleNameMapper in jest.config.js

const mockContract = {
    latestRoundData: () => Promise.resolve([
        BigInt(1), // roundId
        BigInt(200000000000), // answer (price with 8 decimals)
        BigInt(1700000000), // startedAt
        BigInt(1700000000), // updatedAt
        BigInt(1), // answeredInRound
    ]),
    decimals: () => Promise.resolve(8),
};

module.exports = {
    JsonRpcProvider: function () { return {}; },
    Contract: function () { return mockContract; },
    getCreateAddress: function () { return '0x1234567890abcdef1234567890abcdef12345678'; },
    randomBytes: function (size) { return new Uint8Array(size).fill(1); },
    formatUnits: function () { return '2000.00000000'; },
    id: function () { return '0x' + '1234567890abcdef'.repeat(4); },
    toUtf8Bytes: function (text) { return new Uint8Array(Buffer.from(text, 'utf8')); },
    parseUnits: function (value, decimals) { return BigInt(value) * BigInt(10 ** decimals); },
    parseEther: function (value) { return BigInt(value) * BigInt(10 ** 18); },
    formatEther: function (value) { return value.toString(); },
};
