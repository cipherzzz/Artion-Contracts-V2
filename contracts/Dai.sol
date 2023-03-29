pragma solidity ^0.8.0;

// SPDX-License-Identifier: GPL-3.0

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

//create dai erc20
contract Dai is ERC20 {
    constructor() ERC20("Dai", "DAI") {
        _mint(msg.sender, 1000000000000000000000000000);
    }
}