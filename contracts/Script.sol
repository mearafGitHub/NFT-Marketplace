// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MarketHandler.sol"; 
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract Script is ERC1155{
    using Counters for Counters.Counter;
    struct ScriptType{
        address payable scriptWriter;
        address payable scriptOwner; 
        string scriptTitle;
        uint256 scriptPrice;
        uint256 scriptTokenId;
        uint scriptRoyality;
    }
    ScriptType private script;
    address payable _marketHandleraddress;
    MarketHandler _marketHandler;
    uint256 public _fee = 1000 wei;
    bool public _feePaid = false;
    bool private _auction;
    bool private _justGotPayed;
    uint private scriptSellingChoise;
    Counters.Counter private _tokenIdCounter;
    Counters.Counter private _scriptSold;
    ScriptType [] public allScripts;
    uint private paidAmount = 0;
    uint private tokenizingPrice = 1;
    address public contractOwner;
    string hello = "Hey there ;)";

    event SriptTokenCreated(ScriptType script);
    event ScriptJustSold(
        address _buyer,
        address _originalOwner,
        uint256 _scriptPrice
    );
    event GotPaid(
        address _buyer,
        address payable _writer,
        uint amount,
        string script_title
    );
    
    mapping(address => uint) public pendingWithdrawals ;
    mapping (uint256 => ScriptType) public scriptTypesCollection;
    mapping (string => uint256) public scriptsCollectionIds;
    mapping (uint256 => string) public scriptsCollectionTitles;
    enum SellingChoice {Fixed, Offer, Auction}

    constructor() public ERC1155("/home/meraf/Projects/Smart_Contracts/WritersBlock/server/scripts.json"){
        contractOwner = msg.sender;
        _auction = false;
        _justGotPayed = false;
       
    }

    function TokenizeScript(
        uint256 _scriptPrice, 
        uint _scriptSellingChoise, 
        string calldata _scriptTitle, 
        address payable _writer,
        address payable _scriptOwner,
        uint _royality        
        ) 
        public 
        payable
        {
            _tokenIdCounter.increment();    
            scriptSellingChoise = _scriptSellingChoise;
            uint256 _scriptTokenId = _tokenIdCounter.current();
            require((_writer == _scriptOwner), "Writer address not same as owner address.");
            script = ScriptType(
                _writer,
                _scriptOwner,
                _scriptTitle,
                _scriptPrice,
                _scriptTokenId,
                _royality                
            );
            _mint(script.scriptWriter, script.scriptTokenId, 1, "");
            addToScriptList(script);
            emit SriptTokenCreated(script);
            scriptsCollectionIds[_scriptTitle] = _scriptTokenId;
            scriptsCollectionTitles[_scriptTokenId] = _scriptTitle;
            scriptTypesCollection[_scriptTokenId] = script;
    }

    function withdrawMoneyTo(address payable _to, uint256 amount) public returns(bool){
        _to.transfer(amount);
        paidAmount = amount;
        return true;
    }

    function detailViewCharge(uint _detailViewFee) public payable returns(bool){
        require(msg.value == _detailViewFee);
        return true;
    }

    function getScriptIDByTitle(string calldata _title) public view returns(uint256){
        uint _id = scriptsCollectionIds[_title];
        return _id;
    }

    function getScriptTitleById(uint256 _id) public view returns(string memory){
        string memory _title = scriptsCollectionTitles[_id];
        return _title;
    }

    function getScriptByID(uint256 _id)public view returns(ScriptType memory){
        ScriptType memory thisScript = scriptTypesCollection[_id];
        return thisScript;
    }

    function transferScriptOwnership(uint256 _tokenId, address _buyer) external{
        ScriptType memory _script = getScriptByID(_tokenId);
        safeTransferFrom(
            _script.scriptWriter, 
            _buyer, 
            _tokenId, 
            1, 
            ""
        );
        emit ScriptJustSold(
            _buyer, 
            scriptTypesCollection[_tokenId].scriptOwner, 
            scriptTypesCollection[_tokenId].scriptPrice
        );
        _justGotPayed = false;
    }

    function addToScriptList(ScriptType memory _script) private returns(bool success){
        allScripts.push(_script);        
        return true;
    }

    function payListingFee() public payable returns(bool) {
        if(msg.value < _fee){
            revert();
        }
        _feePaid = true;
        return _feePaid;
    }

    function getAllScripts() public view returns(ScriptType[] memory){
        return allScripts;
    }

    function sendMoney(address payable _to) public payable returns(bool){
        bool sent = _to.send(msg.value);
        require(sent, "Failed to send Ether");
        return sent;
    }

    function withdraw() public {
        require(msg.sender == contractOwner, "You are not allowed for this operation.");
        address payable _to= payable(msg.sender);
        uint amount = pendingWithdrawals[msg.sender];
        pendingWithdrawals[msg.sender] = 0;
        _to.transfer(amount);
    }

    receive () external payable{}
    fallback() external payable{}
    

}