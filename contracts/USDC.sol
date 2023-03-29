pragma solidity ^0.8.0;

// SPDX-License-Identifier: GPL-3.0

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

//create usdc erc20
contract Usdc is ERC20 {
    constructor() ERC20("Usdc", "USDC") {
        _mint(msg.sender, 1000000000000000000000000000);
    }
}