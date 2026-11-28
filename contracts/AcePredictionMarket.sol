// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract AcePredictionMarket is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public constant RESOLUTION_TIMEOUT = 3 days;

    struct Market {
        string question;
        address creator;
        uint64 closeTime;
        uint256 totalYes;
        uint256 totalNo;
        bool resolved;
        bool yesWins;
    }

    struct Position {
        uint256 yesStake;
        uint256 noStake;
        bool claimed;
    }

    IERC20 public immutable usdc;
    uint256 public marketCount;

    mapping(uint256 => Market) private _markets;
    mapping(uint256 => mapping(address => Position)) private _positions;

    event MarketCreated(uint256 indexed marketId, address indexed creator, string question, uint64 closeTime);
    event BetPlaced(uint256 indexed marketId, address indexed user, bool isYes, uint256 amount);
    event MarketResolved(uint256 indexed marketId, bool yesWins, bool refundable);
    event Claimed(uint256 indexed marketId, address indexed user, uint256 amount, bool refunded);

    error AlreadyClaimed();
    error AlreadyResolved();
    error BettingClosed();
    error InvalidCloseTime();
    error InvalidToken();
    error MarketNotFound(uint256 marketId);
    error MarketNotSettled();
    error MarketStillOpen();
    error NothingToClaim();
    error ResolutionDeadlinePassed();
    error UnauthorizedResolver();
    error ZeroAmount();

    constructor(IERC20 usdcToken, address initialOwner) Ownable(initialOwner) {
        if (address(usdcToken) == address(0)) revert InvalidToken();
        usdc = usdcToken;
    }

    function createMarket(string calldata question, uint64 closeTime) external returns (uint256 marketId) {
        if (closeTime <= block.timestamp) revert InvalidCloseTime();

        marketId = ++marketCount;
        _markets[marketId] = Market({
            question: question,
            creator: msg.sender,
            closeTime: closeTime,
            totalYes: 0,
            totalNo: 0,
            resolved: false,
            yesWins: false
        });

        emit MarketCreated(marketId, msg.sender, question, closeTime);
    }

    function bet(uint256 marketId, bool isYes, uint256 amount) external nonReentrant {
        Market storage m = _getExistingMarket(marketId);
        if (m.resolved || block.timestamp >= m.closeTime) revert BettingClosed();
        if (amount == 0) revert ZeroAmount();

        usdc.safeTransferFrom(msg.sender, address(this), amount);

        Position storage p = _positions[marketId][msg.sender];
        if (isYes) {
            m.totalYes += amount;
            p.yesStake += amount;
        } else {
            m.totalNo += amount;
            p.noStake += amount;
        }

        emit BetPlaced(marketId, msg.sender, isYes, amount);
    }

    function resolve(uint256 marketId, bool yesWins) external {
        Market storage m = _getExistingMarket(marketId);
        if (m.resolved) revert AlreadyResolved();
        if (block.timestamp < m.closeTime) revert MarketStillOpen();
        if (block.timestamp > uint256(m.closeTime) + RESOLUTION_TIMEOUT) revert ResolutionDeadlinePassed();
        if (msg.sender != owner() && msg.sender != m.creator) revert UnauthorizedResolver();

        m.resolved = true;
        m.yesWins = yesWins;

        bool refundable = (yesWins && m.totalYes == 0) || (!yesWins && m.totalNo == 0);
        emit MarketResolved(marketId, yesWins, refundable);
    }

    function isRefundable(uint256 marketId) public view returns (bool) {
        Market storage m = _getExistingMarket(marketId);
        if (m.resolved) {
            return (m.yesWins && m.totalYes == 0) || (!m.yesWins && m.totalNo == 0);
        }
        return block.timestamp > uint256(m.closeTime) + RESOLUTION_TIMEOUT;
    }

    function previewPayout(uint256 marketId, address user) public view returns (uint256) {
        Market storage m = _getExistingMarket(marketId);
        Position storage p = _positions[marketId][user];
        if (p.claimed) return 0;

        uint256 totalUserStake = p.yesStake + p.noStake;
        if (totalUserStake == 0) return 0;

        if (isRefundable(marketId)) {
            return totalUserStake;
        }

        if (!m.resolved) return 0;

        uint256 totalPool = m.totalYes + m.totalNo;
        if (m.yesWins) {
            if (p.yesStake == 0 || m.totalYes == 0) return 0;
            return (p.yesStake * totalPool) / m.totalYes;
        } else {
            if (p.noStake == 0 || m.totalNo == 0) return 0;
            return (p.noStake * totalPool) / m.totalNo;
        }
    }

    function claim(uint256 marketId) external nonReentrant {
        Market storage m = _getExistingMarket(marketId);
        Position storage p = _positions[marketId][msg.sender];
        if (p.claimed) revert AlreadyClaimed();

        bool refundable = isRefundable(marketId);
        if (!m.resolved && !refundable) revert MarketNotSettled();

        uint256 payout = previewPayout(marketId, msg.sender);
        if (payout == 0) revert NothingToClaim();

        p.claimed = true;
        usdc.safeTransfer(msg.sender, payout);

        emit Claimed(marketId, msg.sender, payout, refundable);
    }

    function getMarket(uint256 marketId) external view returns (Market memory) {
        return _getExistingMarket(marketId);
    }

    function getUserPosition(uint256 marketId, address user)
        external
        view
        returns (uint256 yesStake, uint256 noStake, bool claimed)
    {
        _getExistingMarket(marketId);
        Position storage p = _positions[marketId][user];
        return (p.yesStake, p.noStake, p.claimed);
    }

    function _getExistingMarket(uint256 marketId) private view returns (Market storage m) {
        if (marketId == 0 || marketId > marketCount) revert MarketNotFound(marketId);
        return _markets[marketId];
    }
}
