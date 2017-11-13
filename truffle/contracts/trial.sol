pragma solidity ^0.4.4;

contract trial {
    uint a;
    function geta() constant returns (uint)
    {
        return a;
    }
    function seta(uint value) {
        a=value;
    }

}